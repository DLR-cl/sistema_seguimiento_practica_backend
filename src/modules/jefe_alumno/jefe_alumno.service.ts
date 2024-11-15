import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JefeAlumnoDto } from './dto/jefe-alumno.dto';

import { ResponseJefeAlumnoDto } from './dto/response-jefe-alumno.dto';
import { AuthService } from 'src/auth/auth.service';
import { DatabaseService } from '../../database/database/database.service';
import { Usuarios } from '@prisma/client';
import { AuthRegisterDto } from 'src/auth/dto/authRegisterDto.dto';

@Injectable()
export class JefeAlumnoService {
    constructor(
        private readonly _authService: AuthService,
        private readonly _databaseService: DatabaseService
    ){}
    async registrarJefe(jefe_alumno: JefeAlumnoDto){

        const user: AuthRegisterDto = {
            nombre: jefe_alumno.nombre,
            correo: jefe_alumno.correo,
            rut: jefe_alumno.rut,
            tipo_usuario: jefe_alumno.tipo_usuario
        };

        const usuario = await this._authService.signUp(user);

        const jefe = await this._databaseService.jefesAlumno.create({
            data: {
                id_user: usuario.id_usuario,
                cargo: jefe_alumno.cargo,
                id_empresa: jefe_alumno.id_empresa,
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

    public async getJefeAlumno(id: number): Promise<JefeAlumnoDto> {
            const  jefe = await this._databaseService.jefesAlumno.findUnique({
                where:{
                    id_user: id,
                },
            });
            
            const findUser = await this._databaseService.usuarios.findUnique({
                where: {
                    id_usuario: id,
                },
            })

            if(!findUser){
                throw new BadRequestException('Error al encontrar usuario');
            }

            const usuarioJefe: JefeAlumnoDto = {
                ...findUser,
                ...jefe
            }

            return usuarioJefe;
        
    }
}
