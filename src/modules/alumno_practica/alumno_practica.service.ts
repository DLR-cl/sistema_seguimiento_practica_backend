import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';

import { AlumnoPracticaDto } from './dto/alumno-practica.dto';

import { ResponseAlumnoDto } from './dto/response-alumno.dto';
import { AlumnoDataDto } from './dto/alumno-data.dto';
import { DatabaseService } from '../../database/database/database.service';
import { AuthService } from '../../auth/auth.service';
import { Estado_informe, Estado_practica, Tipo_usuario, TipoPractica, Usuarios } from '@prisma/client';
import { AlumnosDataDto } from './dto/alumnos-data.dto';
import { UsersService } from '../users/users.service';
import { escape } from 'querystring';
import { invertirYCapitalizarNombre } from '../../utils/invertir-nombre.function';
import { EmailAvisosService } from '../email-avisos/email-avisos.service';

@Injectable()
export class AlumnoPracticaService {

    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _authService: AuthService,
        private readonly _userService: UsersService,
        private readonly _emailService: EmailAvisosService
    ){}

    async createAlumnoPractica(alumno_practica: AlumnoPracticaDto){

        if(alumno_practica.nomina){
            alumno_practica.nombre = invertirYCapitalizarNombre(alumno_practica.nombre);
        }

        const crearUser = {
            nombre: alumno_practica.nombre,
            rut: alumno_practica.rut,
            correo: alumno_practica.correo,
            tipo_usuario: alumno_practica.tipo_usuario
        }
        
        const usuario = await this._userService.signUp(crearUser);
        console.log(usuario);
        const alumno = await this._databaseService.alumnosPractica.create({
            data: {
                id_user: usuario.id_usuario,
            }
        });


        const response: ResponseAlumnoDto = {
            message: 'Alumno Creado con éxito',
            status_code: HttpStatus.OK,
            data: usuario,
        };

        // this._emailService.notificacionCreacionCuenta(usuario.id_usuario);
        return response;
    }

    async getAlumnoPracticante(id: number): Promise<AlumnoDataDto>{

        const findUser = await this._databaseService.usuarios.findUnique({
            where:{
                id_usuario: id,
            },
        });

        if(!findUser){
            throw new BadRequestException('Usuario no existente');
        }

        const {password: _, ...userWithoutPassword} = findUser;

        // cambiarlo, exportar modulo de alumnos
        const findAlumno = await this._databaseService.alumnosPractica.findUnique({
            where: {
                id_user: id,
            },
            include: {
                practica: {
                    where: {
                        OR: [
                            {estado: Estado_practica.ESPERA_INFORMES},
                            {estado: Estado_practica.REVISION_GENERAL},
                        ],
                    }
                },
                informe: true,
            }
        });

        const alumno: AlumnoDataDto = {
            ...userWithoutPassword,
            ...findAlumno
        }

        return alumno;
    }



    public async existeAlumno(id_alumno: number){
        const alumno = await this._databaseService.alumnosPractica.findUnique({
            where: {
                id_user: id_alumno,
            }
        });

        if(!alumno){
            return false;
        }

        return true;
    }

    public async getAlumnos(){
        const alumnos: AlumnosDataDto[]= await this._databaseService.usuarios.findMany({
            where:{
                tipo_usuario: Tipo_usuario.ALUMNO_PRACTICA
            },
            select:{
                id_usuario: true,
                nombre: true,
                correo: true,
                rut: true,
                tipo_usuario: true,
                alumno_practica: true
            }

        });
        return alumnos;
    }

    public async activarPractica(id_alumno: number, tipo_practica: TipoPractica){

        if(tipo_practica == TipoPractica.PRACTICA_UNO){
            const alumno = await this._databaseService.alumnosPractica.update({
                where: {
                    id_user: id_alumno,
                },
                data: {
                    primer_practica: true,
                }
            })
        }else if(tipo_practica == TipoPractica.PRACTICA_DOS){
            const alumno = await this._databaseService.alumnosPractica.update({
                where: {
                    id_user: id_alumno,
                },
                data: {
                    segunda_practica: true,
                }
            });
        }else {
            throw new BadRequestException('tipo de práctica no válido para activar la práctica');
        }
    }


}
