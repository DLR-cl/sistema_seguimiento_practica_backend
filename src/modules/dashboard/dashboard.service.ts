import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Estado_informe, Estado_practica, Tipo_usuario } from '@prisma/client';
import { obtenerAcademico, obtenerAprobacionPrimerPractica, obtenerAprobacionSegundaPractica, obtenerCantidadAlumnosPractica, obtenerCantidadInformes, obtenerCantidadPracticasPorTipoPoranno, obtenerCantidadTotalAlumnosPorPractica, obtenerCargaDocente, obtenerDetallesPractica, obtenerEntregaCriticaInforme, obtenerListaInformes, obtenerPracticasAsociadasSupervisor } from '@prisma/client/sql';
import { DatabaseService } from 'src/database/database/database.service';
import { CantidadInformesInterface } from './dto/cantidad-informe.interface';
import { CantidadPractica } from './dto/cantidad-practica-meses.dto';

const MAX_INFORMES = 5;
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
            {informe_confidencial: {
              NOT: {
                estado: "ENVIADA",
              }
            }},
            {
              informe_confidencial: null
            }
          ],
          NOT: {
            OR: [
              {estado: "FINALIZADA"},
              {estado: "REVISION_GENERAL"}
            ]
 
          }
        }
      });


          const cantidadTotalInformes = await this._databaseService.informeConfidencial.count({
            where: {
              id_supervisor: id_supervisor
            }
          });

          return  {
            cantAlumnosAsignados,
            cantidadTotalInformes
          }


    } catch (error) {
      if(error instanceof BadRequestException){
        throw error;
      }

      throw new InternalServerErrorException('Error interno al momento de obtener la cantidad de alumnos asignados a un supervisor');
    }
  }

  // ESTADISTICAS PRACTICA

  async estadisticaPractica() {
    try {
      const estudiantesEnPractica = await this._databaseService.practicas.count({
        where: {
          estado: Estado_practica.CURSANDO,
        },
      });
  
      const estudiantesEnProcesoDeRevison = await this._databaseService.practicas.count({
        where: {
          estado: Estado_practica.REVISION_GENERAL,
        },
      });
  
      const estudiantesNoEntreganInforme = await this._databaseService.practicas.count({
        where: {
          estado: Estado_practica.ESPERA_INFORMES,
        },
      });
  
      const cargaDocente = await this._databaseService.$queryRawTyped<CantidadInformesInterface>(obtenerCargaDocente());
      const cargaDocenteFormatted = cargaDocente.map((docente) => ({
        ...docente,
        cantidad_informes: +docente.cantidad_informes.toString(), // Convertimos BigInt a number
      }));
  
      // Calcular la suma total de informes actuales
      const totalInformesActualesAsignados = cargaDocenteFormatted.reduce(
        (sum, docente) => sum + docente.cantidad_informes,
        0,
      );
  
      // Obtener cantidad de docentes y capacidad máxima
      const cantidadDocentes = await this._databaseService.usuarios.count({
        where: {
          tipo_usuario: {
            in: [Tipo_usuario.ACADEMICO, Tipo_usuario.JEFE_CARRERA, Tipo_usuario.JEFE_DEPARTAMENTO],
          },
        },
      });
  
      const cantidadMaxTotalInformesAcademico = cantidadDocentes * MAX_INFORMES;
  
      // Calcular el porcentaje de carga


      // Retornar resultados
      return {
        estudiantes_practica: estudiantesEnPractica,
        estudiantes_revision: estudiantesEnProcesoDeRevison,
        informes_sin_enviar: estudiantesNoEntreganInforme,
        total_asignados: totalInformesActualesAsignados,
        max_informes: cantidadMaxTotalInformesAcademico,

      };
    } catch (error) {
      throw new InternalServerErrorException('Error interno al obtener las estadísticas de los alumnos');
    }
  }
  
  async obtenerAprobacionPracticas() {
    try {
      const primerPractica = await this._databaseService.$queryRawTyped<any>(obtenerAprobacionPrimerPractica());
      const segundaPractica = await this._databaseService.$queryRawTyped<any>(obtenerAprobacionSegundaPractica());
  
      // Convertir los BigInt a number o string
      const primerPracticaFormatted = primerPractica.map((entry) => ({
        ...entry,
        cantidad: Number(entry.cantidad), // o entry.cantidad.toString() si prefieres string
      }));
  
      const segundaPracticaFormatted = segundaPractica.map((entry) => ({
        ...entry,
        cantidad: Number(entry.cantidad), // o entry.cantidad.toString()
      }));
  
      return {
        primerPractica: primerPracticaFormatted,
        segundaPractica: segundaPracticaFormatted,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error interno al obtener la aprobación de las prácticas');
    }
  }

  async obtenerTotalPracticaAlumnos() {
    try {
      const cursando = await this._databaseService.$queryRawTyped<any>(obtenerCantidadTotalAlumnosPorPractica());
  
      // Convertir BigInt a number
      const cursandoFormatted = cursando.map((entry) => ({
        ...entry,
        cantidad_estudiantes: Number(entry.cantidad_estudiantes), // Convertir BigInt a number
      }));
  
      return cursandoFormatted;
    } catch (error) {
      throw new InternalServerErrorException('Error interno al obtener el total de alumnos por práctica');
    }
  }


  async obtenerDetallesPracticaTodos(){
    try {
      const detalles = await this._databaseService.$queryRawTyped<any>(obtenerDetallesPractica());
      return detalles;
    } catch (error) {
      throw new InternalServerErrorException('Error interno al obtener los detalles');
    }
  }
  
  async obtenerCantidadPracticasPorTipoPorMesSegunAnno(year: number) {
    try {
      const practicas = await this._databaseService.$queryRawTyped<CantidadPractica>(
        obtenerCantidadPracticasPorTipoPoranno(year)
      );
      console.log(practicas)
  
      // Si practicas es null o undefined, devolver un arreglo vacío
      if (!practicas || practicas.length === 0) {
        return [];
      }
  
      // Parsear BigInt a Number con manejo seguro
      const practicasParsed = practicas.map((p:any) => (
        {
        ...p,
        total_practicas: typeof p.total_practicas === 'bigint'
          ? Number(p.total_practicas)
          : p.total_practica,
      }));
  
      return practicasParsed;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error interno al obtener las prácticas por mes y tipo por un año específico'
      );
    }
  }
  
  
  
}
