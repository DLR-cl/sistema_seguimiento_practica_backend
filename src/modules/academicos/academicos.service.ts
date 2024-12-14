import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../database/database/database.service';
import { CreateAcademicoDto } from './dto/create-academicos.dto';
import { access } from 'fs';
import { Estado_informe, PrismaClient, Tipo_usuario, TipoPractica } from '@prisma/client';
import { CantidadInformesPorAcademico } from './dto/cantidad-informes.dto';
import { obtenerAcademico, obtenerCantidadInformes } from '@prisma/client/sql'
import { UsersService } from '../users/users.service';
import { Academico } from './dto/academico.dto';
import { extname, join } from 'path';
import { CrearInformeCorreccion } from './dto/create-correccion-informe.dto';
@Injectable()
export class AcademicosService {
    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _userService: UsersService,
    ) {

    }

    public async obtenerAcademicos() {
        try {
            const academicos = await this._databaseService.usuarios.findMany({
                select: {
                    nombre: true,
                    rut: true,
                    correo: true,
                },
                where: {
                    tipo_usuario: Tipo_usuario.ACADEMICO
                }
            });

            return academicos
        } catch (error) {
            throw error;
        }
    }
    public async obtenerAcademico(id_academico: number) {
        try {
            if (!this.existeAcademico(id_academico)) {
                throw new BadRequestException('Academico no existe')
            }

            const academico = await this._databaseService.$queryRawTyped<Academico>(obtenerAcademico(id_academico))
            return academico;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Error interno al obtener al academico')
        }
    }
    public async crearAcademico(academico: CreateAcademicoDto) {
        try {
            const usuario = await this._userService.signUp({ ...academico })

            const nuevoAcademico = await this._databaseService.academico.create({
                data: {
                    id_user: usuario.id_usuario,
                }
            });

            return {
                message: 'Academico creado con éxito',
                statusCode: HttpStatus.OK,
                data: usuario
            }

        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw error;
        }
    };

    public async existeAcademico(id_academico: number) {
        const academico = await this._databaseService.academico.findUnique({
            where: {
                id_user: id_academico,
            }
        });

        if (academico!) {
            return false;
        }
        return true;
    }

    public async cantidadInformesPorAcademico() {
        try {
            const resultados = await this._databaseService.$queryRawTyped<CantidadInformesPorAcademico>(obtenerCantidadInformes())
            const datosConvertidos = resultados.map((resultado) => ({
                ...resultado,
                cantidad_informes: Number(resultado.cantidad_informes),
            }));

            return datosConvertidos;
        } catch (error) {
            throw error;
        }
    }
    // despues crear dto y el pepe setch
    async subirCorreccion(file: Express.Multer.File, data: CrearInformeCorreccion, rootPath: string) {
        try {
            // Verifica si el informe existe y tiene el estado ENVIADA
            const existeInforme = await this._databaseService.informesAlumno.findUnique({
                where: {
                    id_informe: data.id_informe,
                    estado: Estado_informe.ENVIADA
                }
            });
    
            if (!existeInforme) {
                throw new BadRequestException('Solo se puede enviar una vez la corrección');
            }
    
            // Verifica si el académico tiene permisos
            if (existeInforme.id_academico !== data.id_academico) {
                throw new UnauthorizedException('No posee permisos suficientes para enviar una corrección');
            }
    
            // Actualiza la base de datos con la ruta del archivo
            const filePath = join(rootPath, file.path); // Ruta ya establecida por el interceptor
            const informe = await this._databaseService.informesAlumno.update({
                where: {
                    id_informe: data.id_informe,
                    id_academico: data.id_academico,
                    estado: Estado_informe.REVISION
                },
                data: {
                    archivo_correccion: filePath
                }
            });
    
            return informe;
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
                throw error;
            }
            console.error(error);
            throw new InternalServerErrorException('Error interno al subir un archivo');
        }
    }
    
}
