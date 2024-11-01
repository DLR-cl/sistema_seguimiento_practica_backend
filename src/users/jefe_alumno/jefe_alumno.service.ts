import { HttpStatus, Injectable } from '@nestjs/common';
import { JefeAlumnoDto } from './dto/jefe-alumno.dto';
import { AuthService } from '../../auth/auth.service';
import { DatabaseService } from '../../database/database/database.service';
import { ResponseJefeAlumnoDto } from './dto/response-jefe-alumno.dto';

@Injectable()
export class JefeAlumnoService {
    constructor(
        private readonly _authService: AuthService,
        private readonly _databaseService: DatabaseService
    ){}
    async registrarJefe(jefe_alumno: JefeAlumnoDto){

        const {cargo: _, ...userWithoutCargo} = jefe_alumno;

        const usuario = await this._authService.signUp(userWithoutCargo);

        const jefe = await this._databaseService.jefeAlumno.create({
            data: {
                id_user: usuario.id_usuario,
                cargo: jefe_alumno.cargo,
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
}
