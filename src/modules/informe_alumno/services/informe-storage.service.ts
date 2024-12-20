import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { Informe, InformeDto } from '../dto/informe_pdf.dto';
import { Mutex } from 'async-mutex';
import * as fs from 'fs';
import { Estado_informe, Estado_practica, Tipo_pregunta } from '@prisma/client';
import { resolve } from 'path';
import { CreateRespuestaInformAlumnoDto } from '../dto/class/respuestas';

const informeMutex = new Mutex(); // Mutex para controlar concurrencia

@Injectable()
export class InformeStorageService {
  constructor(private readonly _databaseService: DatabaseService) {}

  async subirInforme(file: Express.Multer.File, data: Informe, rootPath: string) {
    return await informeMutex.runExclusive(async () => {
      const tempFilePath = file.path;
      if (!fs.existsSync(tempFilePath)) {
        throw new BadRequestException('El archivo temporal no existe o no está accesible.');
      }
      
      try {
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

          // Define la carpeta destino según la práctica
          const practicaFolder =
            data.tipo_practica === 'PRACTICA_UNO'
              ? resolve(rootPath, 'informes-practica-uno', 'alumnos')
              : resolve(rootPath, 'informes-practica-dos', 'alumnos');

          if (!fs.existsSync(practicaFolder)) {
            fs.mkdirSync(practicaFolder, { recursive: true });
          }

          // Define el nombre y ruta final del archivo
          const newFileName = `informe-${data.nombre_alumno.replace(/\s+/g, '-')}.pdf`;
          const newFilePath = resolve(practicaFolder, newFileName);

          // Busca un informe en estado CORRECCIÓN
          const informeEnCorreccion = await prisma.informesAlumno.findFirst({
            where: {
              id_alumno: +data.id_alumno,
              estado: Estado_informe.CORRECCION,
            },
          });

          if (informeEnCorreccion) {
            // Elimina el archivo anterior si existe
            if (informeEnCorreccion.archivo && fs.existsSync(informeEnCorreccion.archivo)) {
              fs.unlinkSync(informeEnCorreccion.archivo);
            }

            // Mueve el nuevo archivo desde la carpeta temporal
            fs.renameSync(tempFilePath, newFilePath);

            // Actualiza el registro del informe
            await prisma.informesAlumno.update({
              where: { id_informe: informeEnCorreccion.id_informe },
              data: {
                archivo: newFilePath,
                estado: Estado_informe.REVISION,
              },
            });

            return {
              message: 'Informe reemplazado exitosamente en estado CORRECCIÓN',
              filePath: newFilePath,
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
            fs.renameSync(tempFilePath, newFilePath);

            // Actualiza el registro del informe
            await prisma.informesAlumno.update({
              where: { id_informe: informeEnEspera.id_informe },
              data: {
                archivo: newFilePath,
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

            if(practica.informe_confidencial.estado == Estado_informe.ENVIADA && practica.informe_confidencial){
              await this._databaseService.practicas.update({
                where: { id_practica: informeEnEspera.id_practica },
                data: { estado: Estado_practica.INFORMES_RECIBIDOS }
              })
            }
            return {
              message: 'Informe enviado exitosamente (de ESPERA a ENVIADA)',
              filePath: newFilePath,
            };
          }

          throw new BadRequestException('No se puede subir el informe en el estado actual.');
        });
      } catch (error) {
        console.error('Error al subir el informe:', error);

        // Elimina el archivo temporal si ocurre un error
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }

        throw error;
      }
    });
  }

  private async crearRespuesta(prisma, respuestas: CreateRespuestaInformAlumnoDto[]) {
    try {
        for (let res of respuestas) {
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
            } else {
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
