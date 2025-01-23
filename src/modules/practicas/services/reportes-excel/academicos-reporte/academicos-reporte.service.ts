import { Injectable } from '@nestjs/common';
import { DatabaseService } from './../../../../../database/database/database.service';
import ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class AcademicosReporteService {
    constructor(
        private readonly _databaseService: DatabaseService,
    ) { }

    private async generarReporteAcademicos() {
        const actualYear = new Date().getFullYear();

        // Obtiene todos los académicos junto con sus informes relacionados
        const academicosConInformes = await this._databaseService.academico.findMany({
            include: {
                informe_alumno: {
                    where: {
                        fecha_inicio: {
                            gte: new Date(`${actualYear}-01-01`),
                            lt: new Date(`${actualYear + 1}-01-01`),
                        },
                    },
                },
                informe_confidencial: {
                    where: {
                        fecha_inicio: {
                            gte: new Date(`${actualYear}-01-01`),
                            lt: new Date(`${actualYear + 1}-01-01`),
                        },
                    },
                },
                usuario: true,
            },
        });

        // Procesa los datos para agrupar y contar informes aprobados y reprobados
        const reporte = academicosConInformes.map((academico) => {
            const informesAprobados = academico.informe_alumno.filter(
                (informe) => informe.estado === 'APROBADA'
            ).length;

            const informesReprobados = academico.informe_alumno.filter(
                (informe) => informe.estado === 'DESAPROBADA'
            ).length;

            return {
                academico: {
                    id: academico.id_user,
                    nombre: academico.usuario.nombre,
                },
                aprobados: informesAprobados,
                reprobados: informesReprobados,
            };
        });

        return reporte;
    }


    async generarReporteAlumnos(fechaInicio: Date, fechaFin: Date, data, res: Response) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reporte Alumnos');

        // Estilo del encabezado
        worksheet.columns = [
            { header: 'ID Alumno', key: 'id', width: 15 },
            { header: 'Nombre', key: 'nombre', width: 30 },
            { header: 'Estado', key: 'estado', width: 15 },
            { header: 'Tipo Práctica', key: 'tipoPractica', width: 20 },
            { header: 'Fecha Término', key: 'fechaTermino', width: 20 },
        ];

        worksheet.getRow(1).font = { bold: true, size: 12 };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Agregar datos al Excel
        data.aprobados.forEach((alumno) => {
            worksheet.addRow({
                id: alumno.alumno.usuario.id_usuario,
                nombre: alumno.alumno.usuario.nombre,
                estado: 'Aprobado',
                tipoPractica: alumno.tipo_practica,
                fechaTermino: alumno.fecha_termino,
            });
        });

        data.reprobados.forEach((alumno) => {
            worksheet.addRow({
                id: alumno.alumno.usuario.id_usuario,
                nombre: alumno.alumno.usuario.nombre,
                estado: 'Reprobado',
                tipoPractica: alumno.tipo_practica,
                fechaTermino: alumno.fecha_termino,
            });
        });

        // Guardar el archivo
        await workbook.xlsx.writeFile(`Reporte_Alumnos_${fechaInicio}_${fechaFin}.xlsx`);
        // Enviar el archivo al frontend
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Reporte_Alumnos_${fechaInicio}_${fechaFin}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    }

    private async generarReporteAcademicosSemestral(fechaInicio: Date, fechaFin: Date) {
        // Obtiene todos los académicos junto con sus informes relacionados dentro del intervalo de fechas
        const academicosConInformes = await this._databaseService.academico.findMany({
            include: {
                informe_alumno: {
                    where: {
                        fecha_inicio: {
                            gte: fechaInicio,
                            lt: fechaFin,
                        },
                    },
                },
                informe_confidencial: {
                    where: {
                        fecha_inicio: {
                            gte: fechaInicio,
                            lt: fechaFin,
                        },
                    },
                },
                usuario: true,
            },
        });

        // Procesa los datos para agrupar y contar informes aprobados y reprobados
        const reporte = academicosConInformes.map((academico) => {
            const informesAprobados = academico.informe_alumno.filter(
                (informe) => informe.estado === 'APROBADA'
            ).length;

            const informesReprobados = academico.informe_alumno.filter(
                (informe) => informe.estado === 'DESAPROBADA'
            ).length;

            return {
                academico: {
                    id: academico.id_user,
                    nombre: academico.usuario.nombre,
                },
                aprobados: informesAprobados,
                reprobados: informesReprobados,
            };
        });

        return reporte;
    }

    async generarReporteAcademicosExcel(fechaInicio: Date, fechaFin: Date, data, res: Response) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reporte Académicos');

        // Estilo del encabezado
        worksheet.columns = [
            { header: 'ID Académico', key: 'id', width: 15 },
            { header: 'Nombre', key: 'nombre', width: 30 },
            { header: 'Informes Aprobados', key: 'aprobados', width: 20 },
            { header: 'Informes Reprobados', key: 'reprobados', width: 20 },
        ];

        worksheet.getRow(1).font = { bold: true, size: 12 };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Agregar datos al Excel
        data.forEach((academico) => {
            worksheet.addRow({
                id: academico.academico.id,
                nombre: academico.academico.nombre,
                aprobados: academico.aprobados,
                reprobados: academico.reprobados,
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Reporte_Academicos_${fechaInicio}_${fechaFin}.xlsx`);
      
        await workbook.xlsx.write(res);
        res.end();
    }


}
