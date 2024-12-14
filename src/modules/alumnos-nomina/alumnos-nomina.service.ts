import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';

@Injectable()
export class AlumnosNominaService {

    constructor(
        private readonly _databaseService: DatabaseService
    )    {}
    async guardarUsuarios(datos: { rut: string; nombre: string; email: string }[]): Promise<any> {
        const rutsNomina = datos.map( (alumno) => alumno.rut);

        const alumnosExistentes = await this._databaseService.usuarios.findMany({
            where: {
                rut: { in: rutsNomina },
            },
            select: { rut: true},
        }); 
        
        const rutsExistentes = new Set(alumnosExistentes.map((alumno) => alumno.rut));
        const nuevosAlumnos = datos.filter((alumno) => !rutsExistentes.has(alumno.rut));
        if(nuevosAlumnos.length > 0){
            await this._databaseService.alumnasNomina.createMany({
                data: datos,
              });
        }
        const totalIntentados = datos.length;
        const totalExistentes = alumnosExistentes.length;
        const totalInsertados = nuevosAlumnos.length;
        
        return {
            intentos: totalIntentados,
            cantidad_registrados: totalExistentes,
            cantidad_insertados: totalInsertados,

        }
        
      }

      async obtenerAlumnoNomina(rut: string){
        try {
            const alumno = await this._databaseService.alumnasNomina.findUnique({
                where: {
                    rut: rut,
                }
            });
            if(!alumno){
                throw new BadRequestException(`No existe alumno con rut ${rut}`);
            }
            return alumno;
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
            throw new InternalServerErrorException('Error al obtener un alumno de la nomina');
        }
      }
}
