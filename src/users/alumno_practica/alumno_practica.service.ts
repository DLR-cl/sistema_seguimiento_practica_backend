import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database/database.service';
import { AlumnoPracticaDto } from './dto/alumno-practica.dto';
import { AuthService } from '../../auth/auth.service';
import { ResponseAlumnoDto } from './dto/response-alumno.dto';
import { AlumnoDataDto } from './dto/alumno-data.dto';

@Injectable()
export class AlumnoPracticaService {

    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _authService: AuthService
    ){}

    async createAlumnoPractica(alumno_practica: AlumnoPracticaDto){

        const usuario = await this._authService.signUp(alumno_practica);

        const alumno = await this._databaseService.alumnoPractica.create({
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

        const findUser = await this._databaseService.usuario.findUnique({
            where:{
                id_usuario: id,
            },
        });

        if(!findUser){
            throw new BadRequestException('Error al obtener el usuario');
        }

        const {password: _, ...userWithoutPassword} = findUser;

        const findAlumno = await this._databaseService.alumnoPractica.findUnique({
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
