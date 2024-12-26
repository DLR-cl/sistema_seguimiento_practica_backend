import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JefeAlumnoDto } from './dto/jefe-alumno.dto';

import { ResponseJefeAlumnoDto } from './dto/response-jefe-alumno.dto';
import { AuthService } from '../../auth/auth.service';
import { DatabaseService } from '../../database/database/database.service';
import { Usuarios } from '@prisma/client';
import { AuthRegisterDto } from '../../auth/dto/authRegisterDto.dto';
import { UsersService } from '../users/users.service';
import { InformesPractica, InforPractica } from '../practicas/entities/list-practica.entity';
import { info } from 'console';

@Injectable()
export class JefeAlumnoService {
    constructor(
        private readonly _authService: AuthService,
        private readonly _databaseService: DatabaseService,
        private readonly _userService: UsersService,
    ) { }

    async registrarJefe(jefe_alumno: JefeAlumnoDto) {

        const user: AuthRegisterDto = {
            nombre: jefe_alumno.nombre,
            correo: jefe_alumno.correo,
            rut: jefe_alumno.rut,
            tipo_usuario: jefe_alumno.tipo_usuario
        };

        const usuario = await this._userService.signUp(user);

        const jefe = await this._databaseService.jefesAlumno.create({
            data: {
                id_user: usuario.id_usuario,
                cargo: jefe_alumno.cargo,
                id_empresa: jefe_alumno.id_empresa,
                numero_telefono: jefe_alumno.numero_telefono
            }
        });

        const response: ResponseJefeAlumnoDto = {
            message: 'Jefe del alumno creado con éxito',
            status_code: HttpStatus.OK,
            data: {
                ...usuario,
                cargo: jefe_alumno.cargo
            }
        };

        return response;
    }

    public async getJefeAlumno(id: number) {

        try {


            const jefe = await this._databaseService.jefesAlumno.findUnique({
                where: {
                    id_user: id,
                },
            });

            if (!jefe) {
                throw new BadRequestException('No existe jefe registrado');
            }

            const findUser = await this._databaseService.usuarios.findUnique({
                where: {
                    id_usuario: id,
                },
            })

            if (!findUser) {
                throw new BadRequestException('Error al encontrar usuario');
            }

            const usuarioJefe= {
                id_jefe: findUser.id_usuario,
                nombre: findUser.nombre,
                correo: findUser.correo,
                id_empresa: jefe.id_empresa,
                cargo: jefe.cargo,
            }

            return usuarioJefe;
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
            throw new InternalServerErrorException('Error interno al momento obtener un supervisor')
        }
    }

    public async existeSupervisor(id_supervisor: number) {

        const supervisor = await this._databaseService.jefesAlumno.findUnique({
            where: {
                id_user: id_supervisor,
            }
        });

        if (!supervisor) {
            return false;
        }

        return true;
    }

    public async getEstadoPracticasAsociadas(id_supervisor: number) {
        try {
            const practicas = await this._databaseService.jefesAlumno.findUnique({
                where: {
                    id_user: id_supervisor,
                },
                include: {
                    informe: true,
                    practicas: {
                        include: {
                            alumno: {
                                include: {
                                    usuario: true
                                }
                            },
                            informe_confidencial: true,
                        }
                    },
                }
            });

            let informes: InforPractica[] = [];

            for (let informe of practicas.practicas) {
                let estado: boolean = false;
                if (informe.informe_confidencial !== null) {
                    estado = true;
                    let disponible = informe.informe_confidencial.id_informe_confidencial;
                }
                let disponible = null;

                let inforPractica: InforPractica = {
                    id_practica: informe.id_practica,
                    id_informe_confidencial: disponible,
                    nombre_alumno: informe.alumno.usuario.nombre,
                    estado_entrega: estado,
                    tipo_practica: informe.tipo_practica
                }
                informes.push(inforPractica);
            }
            const listaInformes: InformesPractica = {
                informes_data: informes,
            };

            return listaInformes;
        } catch (error) {
            throw error
        }
    }
}
