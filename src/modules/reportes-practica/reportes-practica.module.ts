import { Module } from '@nestjs/common';
import { ReportesPracticaController } from './reportes-practica.controller';
import { TratamientoDatosService } from '../../services/generacion-reportes/tratamiento-datos/tratamiento-datos.service';
import { ResultadosPracticaService } from '../../services/generacion-reportes/recopilacion-datos/resultados-practica/resultados-practica.service';
import { RecopilacionDatosService } from '../../services/generacion-reportes/recopilacion-datos/informe-confidencial/recopilacion-datos-confidencial.service';
import { GeneracionExcelService } from '../../services/generacion-reportes/generacion-excel/generacion-excel.service';
import { DatabaseService } from '../../database/database/database.service';
import { ReporteResultadoAcademicoService } from '../../services/generacion-reportes/generacion-excel/reporte-resultado-academico/reporte-resultado-academico.service';
import { TratamientoDatosResultadoAcademicoService } from '../../services/generacion-reportes/tratamiento-datos/resultado-academico/resultado-academico.service';
import { ResultadoAcademicoDataService } from '../../services/generacion-reportes/recopilacion-datos/resultado-academico/resultado-academico.service';
import { ResultadoAlumnoService } from '../../services/generacion-reportes/generacion-excel/resultado-alumno/resultado-alumno.service';
import { TratamientoDatosResultadosPracticasAlumnosService } from '../../services/generacion-reportes/tratamiento-datos/resultado-alumno/resultado-alumno.service';
import { ResultadoAlumnoDataService } from '../../services/generacion-reportes/recopilacion-datos/resultado-alumno/resultado-alumno.service';
@Module({
  providers: [
    TratamientoDatosService, 
    RecopilacionDatosService, 
    ResultadosPracticaService, 
    DatabaseService, 
    GeneracionExcelService, 
    ReporteResultadoAcademicoService,
    TratamientoDatosResultadoAcademicoService,
    ResultadoAcademicoDataService,
    ResultadoAlumnoService,
    TratamientoDatosResultadosPracticasAlumnosService,
    ResultadoAlumnoDataService
  ],
  controllers: [ReportesPracticaController]
})
export class ReportesPracticaModule {}
