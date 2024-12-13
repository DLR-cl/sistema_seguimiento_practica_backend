import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Estado_informe, Tipo_usuario } from '@prisma/client';
import { obtenerCantidadAlumnosPractica, obtenerEntregaCriticaInforme, obtenerListaInformes, obtenerPracticasAsociadasSupervisor } from '@prisma/client/sql';
import { DatabaseService } from 'src/database/database/database.service';

@Injectable()
export class DashboardService {
  constructor(private readonly _databaseService: DatabaseService) { }

  public async obtenerCantidadEstudiantesEnPractica() {
    const data = await this._databaseService.$queryRawTyped<any>(obtenerCantidadAlumnosPractica());
    const format = Number(data[0].cantidad_alumnos_practicas);
    return {
      cantidad_alumnos_practica: format
    };
  }
  public async cantidadInformesPendientes(id_academico: number) {
    try {

      let cantidadInformesAlumnos = 0;
      let cantidadInformesConfidenciales = 0;
      
      const poseeInformes = await this._databaseService.academico.findUnique({
        where: {
          id_user: id_academico,
        },
        include: {
          informe_alumno: true,
          informe_confidencial: true,
        }
      })
      console.log(poseeInformes);
      if (poseeInformes.informe_alumno.length > 0 && poseeInformes.informe_confidencial.length > 0) {
        cantidadInformesAlumnos = await this._databaseService.informesAlumno.count({
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

        cantidadInformesConfidenciales= await this._databaseService.informeConfidencial.count({
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
      } else {
        if(poseeInformes.informe_alumno.length == 0){
          cantidadInformesAlumnos = 0;
          cantidadInformesConfidenciales= await this._databaseService.informeConfidencial.count({
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
        }else if(poseeInformes.informe_confidencial.length == 0){
          cantidadInformesConfidenciales = 0;
          cantidadInformesAlumnos = await this._databaseService.informesAlumno.count({
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
        }
      }

      const cant = {
        cantidad_informes_alumno: cantidadInformesAlumnos,
        cantidad_informes_confidenciales: cantidadInformesConfidenciales
      }
      return cant;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al contar los informes pendientes');
    }
  }
  public async obtenerInformacionInformes(id_academico: number) {
    try {
      const userAcademic = await this._databaseService.usuarios.findUnique({
        where: {
          id_usuario: id_academico,
          tipo_usuario: Tipo_usuario.ACADEMICO
        }
      });

      if (!userAcademic) {
        throw new BadRequestException('El usuario no posee la autorizacion para ver estos datos');
      }

      const data = await this._databaseService.$queryRawTyped<any>(obtenerListaInformes(id_academico));
      return data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al obtener la lista de informes');
    }
  }

  public async obtenerEntregaCritica(id_academico: number) {
    try {
      const userAcademic = await this._databaseService.usuarios.findUnique({
        where: {
          id_usuario: id_academico,
          tipo_usuario: Tipo_usuario.ACADEMICO
        }
      });

      if (!userAcademic) {
        throw new BadRequestException('El usuario no posee la autorizacion para ver estos datos');
      }

      const data = await this._databaseService.$queryRawTyped<any>(obtenerEntregaCriticaInforme(id_academico));
      return data;
    } catch (error) {
      throw new InternalServerErrorException('Error interno al momento de obtener los informes de entrega critica');
    }
  }

  public async infoTablaSupervisorPractica(id_supervisor: number){
    try {
      const data = await this._databaseService.$queryRawTyped<any>(obtenerPracticasAsociadasSupervisor(id_supervisor))

      return data;
    } catch (error) {
      throw error;
    }
  }

  public async obtenerCantidadAlumnosAsignadosSupervisor(id_supervisor: number){
    try {
      if(! await this._databaseService.jefesAlumno.findUnique({
        where: {
          id_user: id_supervisor,
        }
      })){
        throw new BadRequestException('Error, el supervisor no existe')
      }

      const cantAlumnosAsignados = await this._databaseService.practicas.count({
        where: {
          id_supervisor: id_supervisor,
          OR: [
            {estado: "CURSANDO"},
            {estado: "ESPERA_INFORMES"}
          ],
          informe_confidencial: {
            NOT: {
              estado: "ENVIADA",
            }
          }
        }
      });

      return {
        cant_alumnos: cantAlumnosAsignados
      }
    } catch (error) {
      if(error instanceof BadRequestException){
        throw error;
      }

      throw new InternalServerErrorException('Error interno al momento de obtener la cantidad de alumnos asignados a un supervisor');
    }
  }
}
