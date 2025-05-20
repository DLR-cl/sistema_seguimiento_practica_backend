import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database/database.service';
import { Informe, InformeDto } from '../dto/informe_pdf.dto';
import { Mutex } from 'async-mutex';
import * as fs from 'fs';
import { Estado_informe, Estado_practica, Tipo_pregunta } from '@prisma/client';
import { resolve } from 'path';
import { CreateRespuestaInformAlumnoDto } from '../dto/class/respuestas';
import { Express } from 'express';
import { Client } from 'basic-ftp'
import { Readable } from 'stream';
import { AlmacenamientoInformeService } from './almacenamiento-informe/almacenamiento-informe.service';
import { ValidacionInformeAlumnoService } from './validacion-informe-alumno/validacion-informe-alumno.service';

@Injectable()
export class InformeStorageService {
  constructor(
    private readonly _databaseService: DatabaseService,
    private readonly _almacenamientoInformeService: AlmacenamientoInformeService,
    private readonly _validacionInformeAlumnoService: ValidacionInformeAlumnoService
  ) { }

  async subirInforme(file: Express.Multer.File, data: Informe, rootPath: string) {
    
      

      try {

        const practica = await this._validacionInformeAlumnoService.obtenerPractica(data.id_informe);

        if(practica.estado === Estado_practica.ESPERA_INFORMES) { // primera vez que se sube el informe
          await this._almacenamientoInformeService.almacenarInforme(file, data, rootPath);
        }
        else {
          if(practica.estado === Estado_practica.REVISION_GENERAL) { // segunda vez que se sube el informe por rechazo
            const informeEnCorreccion = await this._validacionInformeAlumnoService.validarInforme(data); // si no hay nada, sigue el flujo.
            const dataSave = await this._almacenamientoInformeService.almacenarInforme(file, data, rootPath);
          }else{
            throw new BadRequestException('El informe no se puede almacenar porque está en estado REVISION_GENERAL ni ESPERA_INFORMES');
          }
        }

        await this.crearRespuesta(data.respuestas);
        
        // una vez que finalice todo, se cambia el estado del informe y de la práctica.
        await this._databaseService.informesAlumno.update({
          where: { id_informe: +data.id_informe },
          data: { estado: Estado_informe.ENVIADA }
        });

        await this._databaseService.practicas.update({
          where: { id_practica: practica.id_practica },
          data: { estado: Estado_practica.INFORMES_RECIBIDOS }
        });

      } catch (error) {
        throw error;
      }
    }
  


  private async crearRespuesta(respuestas: CreateRespuestaInformAlumnoDto[]) {
    try {

      // las respuestas se generan aun cuando no tengan asignaturas
      const data = respuestas.map((res) => ({
        id_informe: res.id_informe,
        id_pregunta: res.id_pregunta,
        puntaje: res.puntaje || null,
        texto: res.texto || null,
      }));

      await this._databaseService.respuestasInformeAlumno.createMany({
        data: data
      });

      const respuestasConAsignaturas = respuestas.filter((res) => res.asignaturas);

      const dataAsignaturas = respuestasConAsignaturas[0].asignaturas.map((res) => ({
        id_informe: respuestasConAsignaturas[0].id_informe,
        id_pregunta: respuestasConAsignaturas[0].id_pregunta,
        nombre_asignatura: res
      }))

      await this._databaseService.asignaturasEnRespuestasInforme.createMany({
        data: dataAsignaturas,
      })

      return {
        message: 'Respuestas creadas con éxito',
        statusCode: HttpStatus.OK,
      };

    } catch (error) {
      console.error('Error al asignar respuestas a asignaturas:', error);
      throw error;
    }
  }
}

