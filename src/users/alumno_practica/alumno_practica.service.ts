import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database/database.service';
import { AlumnoPracticaDto } from './dto/alumno-practica.dto';
import { AuthService } from '../../auth/auth.service';
import { ResponseAlumnoDto } from './dto/response-alumno.dto';

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
}
