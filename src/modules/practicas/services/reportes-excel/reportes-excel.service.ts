import { Injectable } from '@nestjs/common';
import { Estado_informe, TipoPractica } from '@prisma/client';
import { Response } from 'express';
import { DatabaseService } from '../../../../database/database/database.service';
import { startOfWeek, endOfWeek } from 'date-fns';
@Injectable()
export class ReportesExcelService {

    constructor(
        private readonly _databaseService: DatabaseService
    ){}
    async generarReporte(){

        
    }


    private obtenerDatosEstudiantes(tipo_practica: TipoPractica, estado_aprobacion: Estado_informe){
        const data = this._databaseService.alumnosPractica.findMany({
            where: {
                // Filtrar prácticas por tipo y estado del informe asociado
                practica: {
                  some: {
                    tipo_practica: tipo_practica, // Cambia según el tipo de práctica
                    informe_alumno: {
                      estado: estado_aprobacion,
                    },
                  },
                },
              },
              select: {
                usuario: {
                  select: {
                    rut: true,
                    nombre: true,
                    correo: true,
                  },
                },
                informe: {
                  select: {
                    academico: {
                      select: {
                        usuario: {
                          select: {
                            nombre: true,
                            correo: true,
                          },
                        },
                      },
                    },
                    estado: true, // Por si quieres incluir el estado en los resultados
                  },
                },
              },
        });


    }

    



private async obtenerDatosEstudiantesPorSemana(
  tipo_practica: TipoPractica,
  estado_aprobacion: Estado_informe,
) {
  // Calcular inicio y fin de la semana actual (lunes a domingo)
  const fechaActual = new Date();
  const inicioSemana = startOfWeek(fechaActual, { weekStartsOn: 1 }); // Lunes
  const finSemana = endOfWeek(fechaActual, { weekStartsOn: 1 }); // Domingo

  // Consultar datos desde Prisma
  const data = await this._databaseService.alumnosPractica.findMany({
    where: {
      practica: {
        some: {
          tipo_practica: tipo_practica,
          informe_alumno: {
            estado: estado_aprobacion,
            fecha_inicio_revision: {
              gte: inicioSemana, // Fecha desde el lunes
              lte: finSemana, // Fecha hasta el domingo
            },
          },
        },
      },
    },
    select: {
      usuario: {
        select: {
          rut: true,
          nombre: true,
          correo: true,
        },
      },
      informe: {
        select: {
          academico: {
            select: {
              usuario: {
                select: {
                  nombre: true,
                  correo: true,
                },
              },
            },
          },
          estado: true,
        },
      },
    },
  });

  return data;
}

}
