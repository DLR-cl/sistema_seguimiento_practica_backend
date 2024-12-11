import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Estado_informe, Tipo_usuario } from '@prisma/client';
import { obtenerCantidadAlumnosPractica, obtenerEntregaCriticaInforme, obtenerListaInformes } from '@prisma/client/sql';
import { DatabaseService } from 'src/database/database/database.service';

@Injectable()
export class DashboardService {
    constructor(private readonly _databaseService: DatabaseService){}
    
    public async obtenerCantidadEstudiantesEnPractica(){
        const data =  await this._databaseService.$queryRawTyped<any>(obtenerCantidadAlumnosPractica());
        const format = Number(data[0].cantidad_alumnos_practicas);
        return {
            cantidad_alumnos_practica: format
        };
    }
    public async cantidadInformesPendientes(id_academico: number){
        try {
          const cantInformesAlumnos = await this._databaseService.informesAlumno.count({
            where: {
              id_academico: id_academico,
              NOT: {
                OR: [
                  {
                    estado: Estado_informe.APROBADA,
                  },
                  {
                    estado: Estado_informe.DESAPROBADA
                  }
                ]
              }
            }
          });
  
          const cantInformesConfidenciales = await this._databaseService.informeConfidencial.count({
            where: {
              id_academico: id_academico,
              NOT: {
                OR: [
                  {
                    estado: Estado_informe.APROBADA
                  }
                ]
              }
            }
          });
  
          const cant = {
            cantidad_informes_alumno: cantInformesAlumnos,
            cantidad_informes_confidenciales: cantInformesConfidenciales
          }
          return cant;
        } catch (error) {
          throw new InternalServerErrorException('Error al contar los informes pendientes');
        }
      }
    public async obtenerInformacionInformes(id_academico: number){
        try {
            const userAcademic = await this._databaseService.usuarios.findUnique({
                where: {
                    id_usuario: id_academico,
                    tipo_usuario: Tipo_usuario.ACADEMICO
                }
            });

            if(!userAcademic){
                throw new BadRequestException('El usuario no posee la autorizacion para ver estos datos');
            }

            const data = await this._databaseService.$queryRawTyped<any>(obtenerListaInformes(id_academico));
            return data;
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }            
            throw new InternalServerErrorException('Error interno al obtener la lista de informes');
        }
    }

    public async obtenerEntregaCritica(id_academico: number){
        try {
            const userAcademic = await this._databaseService.usuarios.findUnique({
                where: {
                    id_usuario: id_academico,
                    tipo_usuario: Tipo_usuario.ACADEMICO
                }
            });

            if(!userAcademic){
                throw new BadRequestException('El usuario no posee la autorizacion para ver estos datos');
            }

            const data = await this._databaseService.$queryRawTyped<any>(obtenerEntregaCriticaInforme(id_academico));
            return data;
        } catch (error) {
            throw new InternalServerErrorException('Error interno al momento de obtener los informes de entrega critica');
        }
    }
}
