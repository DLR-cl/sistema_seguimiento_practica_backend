import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';

import { AlumnoPracticaDto } from './dto/alumno-practica.dto';

import { ResponseAlumnoDto } from './dto/response-alumno.dto';
import { AlumnoDataDto } from './dto/alumno-data.dto';
import { DatabaseService } from 'src/database/database/database.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AlumnoPracticaService {

    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _authService: AuthService
    ){}

    async createAlumnoPractica(alumno_practica: AlumnoPracticaDto){

        const usuario = await this._authService.signUp(alumno_practica);

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
}
