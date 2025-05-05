import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../database/database/database.service';
import { invertirYCapitalizarNombre } from '../../utils/invertir-nombre.function';

@Injectable()
export class AlumnosNominaService {

    constructor(
        private readonly _databaseService: DatabaseService
    )    {}
    async guardarUsuarios(datos: { rut: string; nombre: string; email: string }[]): Promise<any> {
        const rutsNomina = datos.map((alumno) => alumno.rut);
    
        // Obtener los registros existentes en la base de datos
        const alumnosExistentes = await this._databaseService.usuarios.findMany({
            where: {
                rut: { in: rutsNomina },
            },
        });
    
        const rutsExistentes = new Set(alumnosExistentes.map((alumno) => alumno.rut));
    
        // Categorizar los datos
        const nuevosAlumnos = datos.filter((alumno) => !rutsExistentes.has(alumno.rut));
        const actualizables = datos.filter((alumno) => {
            const existente = alumnosExistentes.find((dbAlumno) => dbAlumno.rut === alumno.rut);
            return existente && (existente.nombre !== alumno.nombre || existente.correo !== alumno.email);
        });
        const duplicados = datos.filter((alumno) => {
            const existente = alumnosExistentes.find((dbAlumno) => dbAlumno.rut === alumno.rut);
            return existente && existente.nombre === alumno.nombre && existente.correo === alumno.email;
        });
    
        // Insertar nuevos registros
        if (nuevosAlumnos.length > 0) {
            await this._databaseService.alumnasNomina.createMany({
                data: nuevosAlumnos,
                skipDuplicates: true, // Ignora duplicados en la base de datos
            });
        }
    
        // Actualizar registros existentes si hay diferencias
        for (const alumno of actualizables) {
            await this._databaseService.alumnasNomina.update({
                where: { rut: alumno.rut },
                data: {
                    nombre: alumno.nombre,
                    email: alumno.email,
                },
            });
        }
    
        const totalIntentados = datos.length;
        const totalDuplicados = duplicados.length;
        const totalActualizados = actualizables.length;
        const totalInsertados = nuevosAlumnos.length;
    
        return {
            intentos: totalIntentados,
            cantidad_existentes_sin_cambios: totalDuplicados,
            cantidad_actualizados: totalActualizados,
            cantidad_insertados: totalInsertados,
        };
    }
    
    

      async obtenerAlumnoNomina(rut: string){
        try {
            console.log(rut);
            
            const alumno = await this._databaseService.alumnasNomina.findUnique({
                where: { rut }
            });

            console.log(alumno)
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

      async obtenerTodosAlumnosNomina() {
        return await this._databaseService.alumnasNomina.findMany();
      }
}
