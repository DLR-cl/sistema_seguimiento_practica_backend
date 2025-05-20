import { Injectable, Logger } from '@nestjs/common';
import { GeneracionExcelService } from '../generacion-excel/generacion-excel.service';
import * as fs from 'fs';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AutoGeneradoService {
    private readonly logger = new Logger(AutoGeneradoService.name);

    constructor(
        private readonly _generacionExcelService: GeneracionExcelService,
        @InjectQueue('reportes') private reportesQueue: Queue
    ) {}

    @Cron('0 0 * * 0')
    async scheduleReporteSemanal() {
        try {
            // Agregar el trabajo a la cola
            await this.reportesQueue.add('generar-reporte-semanal', {
                timestamp: new Date().toISOString()
            }, {
                jobId: `reporte-semanal-${new Date().toISOString()}`,
                removeOnComplete: true,
                attempts: 3
            });
            this.logger.log('Tarea de generación de reporte semanal programada');
        } catch (error) {
            this.logger.error('Error al programar el reporte semanal:', error);
        }
    }

    private async generarReporteAutoGeneradoSemana() {
        // tomar la fecha actual y ver la fecha de inicio de semana (lunes - domingo)
        const fechaInicioSemana = new Date();
        fechaInicioSemana.setDate(fechaInicioSemana.getDate() - fechaInicioSemana.getDay());
        const fechaFinSemana = new Date(fechaInicioSemana);
        fechaFinSemana.setDate(fechaFinSemana.getDate() + 6);
        
        // obtener los informes de la semana
        const excel = await this._generacionExcelService.generarExcelResultadoPractica(fechaInicioSemana, fechaFinSemana);
        return excel;
    }

    private async almacenarReporteAutoGeneradoSemana() {
        try {
            const excel = await this.generarReporteAutoGeneradoSemana();

            // almacenar el excel en la carpeta del año actual, subcarpeta reporte-mes
            const fecha = new Date();
            const anio = fecha.getFullYear();
            const mes = fecha.getMonth() + 1;
            const ruta = `archivos/reportes/${anio}/${mes}`;
            
            // Crear las carpetas si no existen
            if (!fs.existsSync(ruta)) {
                fs.mkdirSync(ruta, { recursive: true });
            }

            // Crear nombre de archivo con fecha
            const nombreArchivo = `reporte_semanal_${fecha.toISOString().split('T')[0]}.xlsx`;
            fs.writeFileSync(`${ruta}/${nombreArchivo}`, excel.toString());
            
            this.logger.log(`Reporte semanal generado exitosamente: ${nombreArchivo}`);
            return { success: true, ruta: `${ruta}/${nombreArchivo}` };
        } catch (error) {
            this.logger.error('Error al generar el reporte semanal:', error);
            throw error;
        }
    }
}
