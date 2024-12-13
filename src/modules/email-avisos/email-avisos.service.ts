import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { obtenerInformeConfidencialSupersivor, obtenerInformesAcademicos, obtenerPracticaAlumnoVencimiento, obtenerPracticasAsociadasSupervisor } from '@prisma/client/sql';
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
        <p>Atentamente,<br>El equipo de Gestión de Prácticas</p>
    </div>
`,
                };

                await this._mailService.sendEmail(email);
            }));
        } catch (error) {
            throw error;
        }
    }
    @Cron('0 8 * * *')
    private async avisoPracticaAlumnos() {
        try {
            const findAlumnos = await this._databaseService.$queryRawTyped<any>(obtenerPracticaAlumnoVencimiento());

            await Promise.all(
                findAlumnos.map(async (alumno) => {
                    const email: SendEmailDto = {
                        recipients: [alumno.correo_alumno],
                        subject: `Aviso: Tu prácticva está próxima a vencer`,
                        html: `
                            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                                <h2 style="color: #0056b3;">Estimado/a ${alumno.nombre_alumno},</h2>
                                <p>Te informamos que tu práctica <strong>${alumno.tipo_practica}</strong> está próxima a vencer.</p>
                                <p><strong>Días restantes para finalizar tu práctica:</strong> ${alumno.dias_restantes_practica} día(s).</p>
                                <p>Si necesitas extender el plazo de tu práctica, por favor comunícate a la brevedad con secretaría.</p>
                                <p>Atentamente,<br>El equipo de Gestión de Prácticas</p>
                            </div>
                        `,
                    };

                    await this._mailService.sendEmail(email);
                })
            );

            console.log('Correos enviados con éxito a los alumnos.');
        } catch (error) {
            console.error('Error al enviar los correos a los alumnos:', error);
            throw error;
        }
    }

    @Cron('39 16 * * *')
    private async avisoDiasRestanteEnvioConfidencial() {
        try {
            // Obtiene los datos desde la base de datos
            const informesConfidenciales = await this._databaseService.$queryRawTyped<any>(
                obtenerInformeConfidencialSupersivor()
            );
    
            // Itera sobre los informes y envía correos
            await Promise.all(
                informesConfidenciales.map(async (informe) => {
                    const email: SendEmailDto = {
                        recipients: [informe.correo_supervisor],
                        subject: `Aviso: Quedan ${informe.dias_restantes} días para enviar el informe confidencial`,
                        html: this.generarCuerpoCorreoHTML(informe),
                    };
    
                    // Llama al servicio de envío de correos
                    await this._mailService.sendEmail(email);
                })
            );
        } catch (error) {
            throw error;
        }
    }
    
    // Método para generar el cuerpo del correo en HTML con estilo TailwindCSS
    private generarCuerpoCorreoHTML(informe: any): string {
        return `
            <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); padding: 20px;">
                    <h2 style="color: #1f2937; font-size: 18px; font-weight: 600;">Hola ${informe.nombre_supervisor},</h2>
    
                    <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                        Le recordamos que le quedan <strong style="color: #ef4444;">${informe.dias_restantes} días</strong> para enviar el informe confidencial correspondiente a la práctica del estudiante <strong>${informe.nombre_alumno}</strong>, quien realiza la práctica de tipo <em>"${informe.tipo_practica}"</em>.
                    </p>
    
                    <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                        La fecha límite para la entrega del informe es el <strong style="color: #3b82f6;">${new Date(informe.fecha_limite_entrega).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}</strong>.
                    </p>
    
                    <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                        Por favor, asegúrese de completar este proceso dentro del plazo indicado. Si tiene alguna duda o inconveniente, no dude en contactarnos.
                    </p>
    
                    <p style="color: #1f2937; font-size: 16px; margin-top: 30px;">Saludos cordiales,</p>
                    <p style="color: #1f2937; font-size: 16px; font-weight: 600;">El equipo de Gestión de Prácticas</p>
                </div>
            </div>
        `;
    }
    
    
    

}
