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
const informeMutex = new Mutex(); // Mutex para controlar concurrencia

@Injectable()
export class InformeStorageService {
  constructor(private readonly _databaseService: DatabaseService) { }

  async subirInforme(file: Express.Multer.File, data: Informe, rootPath: string) {
    return await informeMutex.runExclusive(async () => {
      if (!file || !file.buffer) {
        throw new BadRequestException('El archivo no existe o no está accesible.');
      }

      const client = new Client();
      client.ftp.verbose = true;


      let remoteFilePath: string;
      try {
        await client.access({
          host: process.env.HOST_FTP,
          port: +process.env.PORT_FTP,
          user: process.env.USER_FTP,
          password: process.env.PASSWORD_FTP,
          secure: false,
      });

        

  
        // Define la carpeta y ruta remota según la práctica
        const practicaFolder =
          data.tipo_practica === 'PRACTICA_UNO'
            ? `/informes-practica-uno/alumnos`
            : `/informes-practica-dos/alumnos`;

        const remoteFileName = `informe-${data.nombre_alumno.replace(/\s+/g, '-')}.pdf`;
        remoteFilePath = `${practicaFolder}/${remoteFileName}`;

        // Crea la carpeta remota si no existe
        try {
          await client.ensureDir(practicaFolder);
          console.log(`Directorio remoto asegurado: ${practicaFolder}`);
      } catch (err) {
          console.warn(`El directorio remoto ya existe o no pudo ser creado: ${err.message}`);
      }

        // Sube el archivo al servidor remoto
        // Inicia una transacción
        return await this._databaseService.$transaction(async (prisma) => {
          // Verifica si el alumno existe
          const existeAlumno = await prisma.alumnosPractica.findUnique({
            where: { id_user: +data.id_alumno },
            include: { usuario: true },
          });

          if (!existeAlumno) {
            throw new NotFoundException(`No se encontró un alumno con el ID ${data.id_alumno}`);
          }
          // Busca un informe en estado CORRECCIÓN
          const informeEnCorreccion = await prisma.informesAlumno.findFirst({
            where: {
              id_alumno: +data.id_alumno,
              estado: Estado_informe.CORRECCION,
            },
          });

          if (informeEnCorreccion) {
            // Elimina el archivo anterior si existe
            if (informeEnCorreccion.archivo) {
              try {
                  await client.remove(informeEnCorreccion.archivo);
                  console.warn(`Archivo anterior eliminado del FTP: ${informeEnCorreccion.archivo}`);
              } catch (deleteError) {
                  console.error(
                      `Error al intentar eliminar el archivo anterior del FTP (${informeEnCorreccion.archivo}):`,
                      deleteError
                  );
              }
          }
          // actualiza
            const stream = Readable.from(file.buffer)
            await client.uploadFrom(stream, remoteFilePath);



            // Actualiza el registro del informe
            await prisma.informesAlumno.update({
              where: { id_informe: informeEnCorreccion.id_informe },
              data: {
                archivo: remoteFilePath,
                estado: Estado_informe.REVISION,
              },
            });

            return {
              message: 'Informe reemplazado exitosamente en estado CORRECCIÓN',
              filePath: remoteFilePath,
            };
          }

          // Busca un informe en estado ESPERA
          const informeEnEspera = await prisma.informesAlumno.findFirst({
            where: {
              id_alumno: +data.id_alumno,
              estado: Estado_informe.ESPERA,
            },
          });

          if (informeEnEspera) {
            // Mueve el archivo desde la carpeta temporal
            const stream = Readable.from(file.buffer)
            await client.uploadFrom(stream, remoteFilePath);
            // Actualiza el registro del informe
            await prisma.informesAlumno.update({
              where: { id_informe: informeEnEspera.id_informe },
              data: {
                archivo: remoteFilePath,
                estado: Estado_informe.ENVIADA,
              },
            });



            // Crea las respuestas
            await this.crearRespuesta(prisma, data.respuestas);
            const practica = await this._databaseService.practicas.findUnique({
              where: {
                id_practica: informeEnEspera.id_practica,
              },
              include: {
                informe_confidencial: true
              }
            });

            if (practica.informe_confidencial.estado == Estado_informe.ENVIADA && practica.informe_confidencial) {
              await this._databaseService.practicas.update({
                where: { id_practica: informeEnEspera.id_practica },
                data: { estado: Estado_practica.INFORMES_RECIBIDOS }
              })
            }
            return {
              message: 'Informe enviado exitosamente (de ESPERA a ENVIADA).',
              filePath: remoteFilePath,
            };
          }

          throw new BadRequestException('No se puede subir el informe en el estado actual.');
        });
      } catch (error) {
        console.error('Error al subir el informe:', error);

        // Elimina el archivo temporal si ocurre un error
        // Compensación: elimina el archivo del FTP si ya fue subido
        if (remoteFilePath) {
          try {
              await client.remove(remoteFilePath);
              console.warn(`Archivo eliminado del FTP: ${remoteFilePath}`);
          } catch (deleteError) {
              console.error('Error al intentar eliminar el archivo del FTP:', deleteError);
          }
      }
      throw error;
      } finally {
        client.close();
      }
    });
  }

  private async crearRespuesta(prisma, respuestas: CreateRespuestaInformAlumnoDto[]) {
    try {
      for (let res of respuestas) {
        console.log(respuestas)
        if (res.asignaturas) {
          // Crea la respuesta principal
          const respuesta = await prisma.respuestasInformeAlumno.create({
            data: {
              id_informe: res.id_informe,
              id_pregunta: res.id_pregunta,
            },
          });

          // Maneja asignaturas relacionadas con la respuesta
          await this.asignarRespuestasAsignaturasRespuesta(
            prisma,
            res.asignaturas,
            res.id_informe,
            res.id_pregunta
          );
        } else if (res.puntaje) {
          console.log(res)
          // Verifica si la pregunta es de tipo evaluativa
          const findPregunta = await prisma.preguntasImplementadasInformeAlumno.findUnique({
            where: {
              id_pregunta: res.id_pregunta,
            },
            include: {
              preguntas: true,
            },
          });

          // Crea la respuesta con puntaje
          await prisma.respuestasInformeAlumno.create({
            data: {
              id_informe: res.id_informe,
              id_pregunta: res.id_pregunta,
              puntaje: res.puntaje,
            },
          });
        } else if (res.texto) {
          console.log("res", res)

          // Crea una respuesta con texto
          await prisma.respuestasInformeAlumno.create({
            data: {
              id_informe: res.id_informe,
              id_pregunta: res.id_pregunta,
              texto: res.texto,
            },
          });
        }
      }

      return {
        message: 'Respuestas creadas con éxito',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      console.error('Error al crear respuestas:', error);
      throw error;
    }
  }

  private async asignarRespuestasAsignaturasRespuesta(
    prisma,
    asignaturas: string[],
    id_informe: number,
    id_respuesta: number
  ) {
    try {
      const array = asignaturas.map((asig) => ({
        id_informe: id_informe,
        id_pregunta: id_respuesta,
        nombre_asignatura: asig,
      }));

      // Crea las asignaturas relacionadas en batch
      await prisma.asignaturasEnRespuestasInforme.createMany({
        data: array,
      });
    } catch (error) {
      console.error('Error al asignar respuestas a asignaturas:', error);
      throw error;
    }
  }

}
