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
import internal, { Readable, Writable } from 'stream';
import { InformeDto } from './dto/informe_pdf.dto';
import { Mutex } from 'async-mutex';
import { Client } from 'basic-ftp';


const respuestasMutex = new Mutex();
@Injectable()
export class InformeAlumnoService {
  private readonly ftpConfig = {
    host: process.env.HOST_FTP,
    port: +process.env.PORT_FTP,
    user: process.env.USER_FTP,
    password: process.env.PASSWORD_FTP,
    secure: false,
  }
  constructor(
    private readonly _databaseService: DatabaseService,
    private readonly _practicaService: PracticasService,

    private readonly _emailService: EmailAvisosService,

  ) {
  }

  async getArchivo(id_informe: number) {
    const startTime = new Date(); // Marca el inicio

    // Obtener el informe por ID
    const informe = await this.getInformePorId(id_informe);

    if (!informe || !informe.archivo) {
      throw new NotFoundException('No se encontró el informe del alumno');
    }

    try {
      // Verificar si el archivo existe en el sistema de archivos local
      if (!fs.existsSync(informe.archivo)) {
        throw new NotFoundException('El archivo no existe en el sistema de archivos local');
      }

      // Leer el archivo y crear un stream legible
      const fileBuffer = fs.readFileSync(informe.archivo);
      const readableStream = Readable.from(fileBuffer);

      const endTime = new Date(); // Marca el final
      const elapsedTime = endTime.getTime() - startTime.getTime(); // Tiempo en milisegundos
      console.log(`Tiempo total de ejecución: ${elapsedTime / 1000} segundos`);

      return readableStream;
    } catch (error) {
      console.error('Error al leer el archivo:', error);
      throw new InternalServerErrorException('Error al leer el archivo del informe');
    }
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

      if (informe.estado == Estado_informe.CORRECCION) {
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


  public async getAllRespuestas() {
    return await this._databaseService.respuestasInformeAlumno.findMany();
  }

  public async getAllRespuestasConAsignaturas() {
    try {
      const respuestasAsignaturas = await this._databaseService.respuestasInformeAlumno.findMany({
        where: {
          NOT: {
            asignaturas: null
          }
        },
        include: {
          asignaturas: true,
        }
      });

      return respuestasAsignaturas;
    } catch (error) {

    }
  }

  async getArchivoCorreccion(id_informe: number): Promise<Readable> {
    // Obtener el informe por ID desde la base de datos
    const informe = await this._databaseService.informesAlumno.findUnique({
      where: { id_informe: +id_informe },
      select: { archivo: true },
    });

    if (!informe || !informe.archivo) {
      throw new NotFoundException('No se encontró el informe del alumno');
    }

    const client = new Client();
    client.ftp.verbose = true;

    try {
      // Conectar al servidor FTP
      await client.access({
        host: process.env.HOST_FTP,
        port: +process.env.PORT_FTP,
        user: process.env.USER_FTP,
        password: process.env.PASSWORD_FTP,
        secure: false,
      });
      console.log('Conexión exitosa al FTP');

      // Verificar si el archivo existe en el servidor FTP
      const existeArchivo = await client.size(informe.archivo).catch(() => null);
      if (!existeArchivo) {
        throw new NotFoundException('El archivo no existe en el servidor FTP');
      }

      // Crear un Writable stream para almacenar el archivo descargado
      const buffer: Buffer[] = [];
      const writable = new Writable({
        write(chunk, encoding, callback) {
          buffer.push(chunk); // Almacenar cada chunk de datos en el array
          callback();
        },
      });

      // Descargar el archivo al Writable stream
      await client.downloadTo(writable, informe.archivo);

      // Combinar todos los chunks en un único buffer y crear un flujo legible
      const combinedBuffer = Buffer.concat(buffer);
      return Readable.from(combinedBuffer);
    } finally {
      // Cerrar la conexión FTP
      client.close();
    }
  }
}
