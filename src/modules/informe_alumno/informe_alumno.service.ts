import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, Param, UnauthorizedException } from '@nestjs/common';
import { CreateInformeAlumnoDto } from './dto/create-informe-alumno.dto';
import { DatabaseService } from '../../database/database/database.service';
import { Estado_informe, Estado_practica, InformesAlumno, TipoPractica } from '@prisma/client';
import { AlumnoPracticaService } from '../alumno_practica/alumno_practica.service';
import { PracticasService } from '../practicas/practicas.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { CreateEnlaceDto } from './dto/create-enlace.dto';
import * as fs from 'fs';
import { file } from 'googleapis/build/src/apis/file';
import { extname, join, resolve } from 'path';
import { info } from 'console';
import { EmailAvisosService } from '../email-avisos/email-avisos.service';
import { AprobacionInformeDto, Comentario } from './dto/aprobacion-informe.dto';
import internal from 'stream';
import { InformeDto } from './dto/informe_pdf.dto';
import { Mutex } from 'async-mutex';


const respuestasMutex = new Mutex();
@Injectable()
export class InformeAlumnoService {
    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _practicaService: PracticasService,

        private readonly _emailService: EmailAvisosService,

    ) {
    }

    async getArchivo(id_informe: number) {
        // Obtener el informe por ID
        const informe = await this.getInformePorId(id_informe);

        if (!informe || !informe.archivo) {
            throw new NotFoundException('No se encontró el informe del alumno');
        }

        // La ruta completa ya está almacenada en informe.archivo_informe
        const filePath = resolve(informe.archivo);

        if (!fs.existsSync(filePath)) {
            throw new NotFoundException('El archivo no existe en el sistema de archivos');
        }

        return fs.createReadStream(filePath); // Retornar un stream para el controlador
    }

    private async getInformePorId(id_informe: number) {
        return await this._databaseService.informesAlumno.findUnique({
            where: { id_informe },
        });
    }
    async obtenerRespuestasInforme(id_informe: number) {
        // Obtener acceso exclusivo con el mutex
        return await respuestasMutex.runExclusive(async () => {
          try {
            // Validación inicial: Verificar si el informe existe
            const informe = await this._databaseService.informesAlumno.findUnique({
              where: { id_informe },
            });
      
            if (!informe) {
              throw new BadRequestException('El informe especificado no existe.');
            }
      
            // Consulta todas las respuestas asociadas al informe
            const respuestas = await this._databaseService.respuestasInformeAlumno.findMany({
              where: { id_informe },
              include: {
                pregunta: {
                  include: {
                    preguntas: true, // Relación con la tabla Preguntas
                  },
                },
                asignaturas: {
                  include: {
                    asignatura: true, // Relación con Asignaturas
                  },
                },
              },
            });
      
            if (!respuestas || respuestas.length === 0) {
              throw new BadRequestException('No se encontraron respuestas para este informe de alumno.');
            }
      
            // Filtrar la respuesta que contiene asignaturas
            const respuestaConAsignaturas = respuestas.find(
              (res) => res.asignaturas && res.asignaturas.length > 0
            );
      
            // Obtener las asignaturas asociadas (si existen)
            const asignaturas = respuestaConAsignaturas
              ? respuestaConAsignaturas.asignaturas.map((asignaturaRelacion) => ({
                  nombre_asignatura: asignaturaRelacion.nombre_asignatura,
                  tipo_asignatura: asignaturaRelacion.asignatura.tipo_asignatura,
                  codigo: asignaturaRelacion.asignatura.codigo,
                }))
              : []; // Si no hay respuesta con asignaturas, retornar una lista vacía
      
            // Validación adicional: Comprobar si las asignaturas están vacías cuando deberían existir
            if (respuestaConAsignaturas && asignaturas.length === 0) {
              throw new InternalServerErrorException('Se esperaba asignaturas, pero no se encontraron.');
            }
      
            // Transformar las respuestas para devolver un formato más claro
            const resultados = respuestas.map((res) => ({
              respuesta_texto: res.texto,
              puntaje: res.puntaje,
              nota: res.nota,
              pregunta: res.pregunta.preguntas.enunciado_pregunta,
            }));
      
            return { respuestas: resultados, asignaturas };
          } catch (error) {
            if (error instanceof BadRequestException) {
              throw error;
            }
            throw new InternalServerErrorException('Error interno al obtener las respuestas del informe de alumno.');
          }
        });
      }
      

    public async existeRespuestaInforme(id_informe: number) {
        try {
            const informe = await this._databaseService.informesAlumno.findUnique({
                where: {
                    id_informe: Number(id_informe)
                },
            });

            let existe: boolean = false;

            if (!informe) {
                throw new BadRequestException('Error, el informe no existe o no está enviado.')
            }

            if (informe.estado in [Estado_informe.ENVIADA, Estado_informe.REVISION, Estado_informe.APROBADA, Estado_informe.DESAPROBADA]) {
                existe = true;
            }


            return {
                correccion: existe
            }
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Error interno al ver si se encuentra respondido un informe');
        }
    }


    public async getAllRespuestas(){
        return await this._databaseService.respuestasInformeAlumno.findMany();
    }

    public async getAllRespuestasConAsignaturas(){
        try {
            const respuestasAsignaturas = await this._databaseService.respuestasInformeAlumno.findMany({
                where: {
                    NOT: {
                        asignaturas: null
                    }
                },
                include:{
                    asignaturas: true,
                }
            });

            return respuestasAsignaturas;
        } catch (error) {
            
        }
    }

}
