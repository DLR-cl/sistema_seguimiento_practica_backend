import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { obtenerInformesAcademicos } from '@prisma/client/sql';
import { DatabaseService } from 'src/database/database/database.service';
import { SendEmailDto } from 'src/mail/dto/mail.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class EmailAvisosService {
    constructor(
        private readonly _mailService: MailService,
        private readonly _databaseService: DatabaseService,
    ) { }

    private async avisoCercanoVencerInformeAlumnosAcademicos() {
        try {
            // ¿Cómo determino cuántos días le quedan?
            const academicos = this._databaseService.$queryRawTyped<any>(obtenerInformesAcademicos())

            // hacer correo a estos
            // Mapear datos y enviar correos
            await Promise.all((await academicos).map(async (academico) => {
                const email: SendEmailDto = {
                    recipients: [academico.correo_academico],
                    subject: `Aviso: Informe de ${academico.nombre_alumno} está próximo a vencer`,
                    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2 style="color: #0056b3;">Estimado/a ${academico.nombre_academico},</h2>
        <p>Le informamos que el informe de práctica del alumno <strong>${academico.nombre_alumno}</strong>, correspondiente a la práctica <strong>${academico.tipo_practica}</strong>, está próximo a vencer.</p>
        <p><strong>Estado actual del informe:</strong> ${academico.estado_informe}</p>
        <p><strong>Fecha de inicio de revisión:</strong> ${new Date(academico.inicio_revision).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}</p>
        <p><strong>Fecha límite para revisión:</strong> ${new Date(academico.fin_revision).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}</p>
        <p><strong>Días restantes para la revisión:</strong> ${academico.dias_para_revision} día(s).</p>
        <p>Por favor, proceda con la revisión a la brevedad para garantizar el cumplimiento del plazo.</p>
        <p>Atentamente,<br>El equipo de Gestión de Informes</p>
    </div>
`,
                };

                await this._mailService.sendEmail(email);
            }));
        } catch (error) {
            throw error;
        }
    }

    private async avisoPracticaAlumnos(){
        try {
            const findAlumnos = await this._databaseService.alumnosPractica.findMany();
        } catch (error) {
            
        }
    }

}
