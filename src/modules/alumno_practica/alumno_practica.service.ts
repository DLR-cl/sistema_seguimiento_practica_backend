import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';

import { AlumnoPracticaDto } from './dto/alumno-practica.dto';

import { ResponseAlumnoDto } from './dto/response-alumno.dto';
import { AlumnoDataDto } from './dto/alumno-data.dto';
import { DatabaseService } from '../../database/database/database.service';
import { AuthService } from '../../auth/auth.service';
import { Tipo_usuario, TipoPractica, Usuarios } from '@prisma/client';
import { AlumnosDataDto } from './dto/alumnos-data.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AlumnoPracticaService {

    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _authService: AuthService,
        private readonly _userService: UsersService
    ){}

    async createAlumnoPractica(alumno_practica: AlumnoPracticaDto){

        const usuario = await this._userService.signUp(alumno_practica);
        console.log(usuario);
        const alumno = await this._databaseService.alumnosPractica.create({
            data: {
                id_user: usuario.id_usuario,
            }
        });

        const {password: _, ...userWithoutPassword } = usuario;

        const response: ResponseAlumnoDto = {
            message: 'Usuario Creado con éxito',
            status_code: HttpStatus.OK,
            data: userWithoutPassword,
        };
        return response;
    }

    async getAlumnoPracticante(id: number): Promise<AlumnoDataDto>{

        const findUser = await this._databaseService.usuarios.findUnique({
            where:{
                id_usuario: id,
            },
        });

        if(!findUser){
            throw new BadRequestException('Error al obtener el usuario');
        }

        const {password: _, ...userWithoutPassword} = findUser;

        // cambiarlo, exportar modulo de alumnos
        const findAlumno = await this._databaseService.alumnosPractica.findUnique({
            where: {
                id_user: id,
            }
        });

        const alumno: AlumnoDataDto = {
            ...userWithoutPassword,
            ...findAlumno
        }

        return alumno;
    }

    // se debe diferenciar en qué práctica está activo
    public async alumnoActivo(id_alumno: number): Promise<TipoPractica | null>{
        const alumno = await this._databaseService.alumnosPractica.findUnique({
            where:{
                id_user: id_alumno,
            }
        });

        if(!alumno){
            throw new BadRequestException('Alumno no existe');
        }

        if(alumno.primer_practica){
            return TipoPractica.PRACTICA_UNO;
        }else if(alumno.segunda_practica){
            return TipoPractica.PRACTICA_DOS;
        }else{
            return null;
        }

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
