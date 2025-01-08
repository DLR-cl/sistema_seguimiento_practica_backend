import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Estado_informe } from '@prisma/client';
import { obtenerInformeConfidencialSupersivor, obtenerInformesAcademicos, obtenerPracticaAlumnoVencimiento, obtenerPracticasAsociadasSupervisor } from '@prisma/client/sql';
import { DatabaseService } from '../../database/database/database.service';
import { SendEmailDto } from '../../mail/dto/mail.dto';
import { MailService } from '../../mail/mail.service';

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

    // enviar a alumno y academico 
    public async notificacionAsignacion(id_academico: number, id_informe: number) {
        try {
            // Obtener datos del académico
            const academico = await this._databaseService.usuarios.findUnique({
                where: { id_usuario: id_academico },
            });

            if (!academico) {
                throw new Error(`No se encontró un académico con el ID ${id_academico}`);
            }

            // Obtener datos del informe
            const informe = await this._databaseService.informesAlumno.findUnique({
                where: { id_informe: id_informe },
                include: { practica: true }, // Incluye información de la práctica
            });

            if (!informe) {
                throw new Error(`No se encontró un informe con el ID ${id_informe}`);
            }

            // Obtener datos del alumno
            const estudiante = await this._databaseService.usuarios.findUnique({
                where: { id_usuario: informe.id_alumno },
            });

            if (!estudiante) {
                throw new Error(`No se encontró un estudiante con el ID ${informe.id_alumno}`);
            }
            const fechaInicioRevision = new Date(informe.fecha_inicio_revision).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            const fechaFinTentativa = new Date(informe.fecha_termino_revision).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            // Generar correos
            const emailAcademico: SendEmailDto = {
                recipients: [academico.correo],
                subject: `Asignación de informe confidencial - ${estudiante.nombre}`,
                html: `
                <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); padding: 20px;">
                        <h2 style="color: #1f2937; font-size: 18px; font-weight: 600;">Hola ${academico.nombre},</h2>
                        <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                            Se le ha asignado el informe confidencial del estudiante <strong>${estudiante.nombre}</strong>, quien está realizando la práctica de tipo <em>"${informe.practica.tipo_practica}"</em>.
                        </p>
                        <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                            La revisión del informe deberá comenzar el <strong>${fechaInicioRevision}</strong> y tiene como fecha tentativa de término el <strong>${fechaFinTentativa}</strong>.
                        </p>
                        <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                            Por favor, revise y gestione el informe correspondiente dentro del plazo establecido.
                        </p>
                        <p style="color: #1f2937; font-size: 16px; margin-top: 30px;">Saludos cordiales,</p>
                        <p style="color: #1f2937; font-size: 16px; font-weight: 600;">El equipo de Gestión de Prácticas</p>
                    </div>
                </div>
            `,
            };



            // Llamar al servicio de envío de correos
            await this._mailService.sendEmail(emailAcademico);


            console.log('Correos enviados exitosamente.');
        } catch (error) {
            console.error('Error al enviar las notificaciones:', error.message);
        }
    }


    public async notificacionCambioEstado(id_informe: number, estado: Estado_informe) {
        try {
            // Obtener datos del informe
            const informe = await this._databaseService.informesAlumno.findUnique({
                where: { id_informe },
                include: { alumno: { include: { usuario: true } } }, // Incluye datos del alumno relacionado
            });

            if (!informe) {
                throw new Error(`No se encontró un informe con el ID ${id_informe}`);
            }

            const alumno = informe.alumno;

            if (!alumno) {
                throw new Error(`No se encontró un alumno relacionado con el informe ID ${id_informe}`);
            }

            const emailAlumno: SendEmailDto = {
                recipients: [alumno.usuario.correo],
                subject: this.getEmailSubject(estado),
                html: this.getEmailHtml(estado, alumno.usuario.nombre, id_informe),
            };

            // Enviar el correo al alumno
            await this._mailService.sendEmail(emailAlumno);

            console.log(`Correo enviado al alumno ${alumno.usuario.correo} para el estado ${estado}`);
        } catch (error) {
            console.error('Error al enviar la notificación:', error.message);
        }
    }

    private getEmailSubject(estado: Estado_informe): string {
        switch (estado) {
            case Estado_informe.APROBADA:
                return 'Informe aprobado';
            case Estado_informe.DESAPROBADA:
                return 'Informe desaprobado';
            case Estado_informe.CORRECCION:
                return 'Corrección requerida en su informe';
            default:
                return 'Actualización sobre su informe';
        }
    }

    private getEmailHtml(estado: Estado_informe, nombreAlumno: string, idInforme: number): string {

        switch (estado) {
            case Estado_informe.APROBADA:
                return `
                <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); padding: 20px;">
                        <h2 style="color: #1f2937; font-size: 18px; font-weight: 600;">¡Hola ${nombreAlumno}!</h2>
                        <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                            ¡Nos alegra mucho informarte que tu informe ha sido <strong>APROBADO</strong>! 
                        </p>
                        <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                            Este es un gran paso en tu práctica profesional. Felicitaciones por el esfuerzo y dedicación que has demostrado.
                        </p>
                        <p style="color: #1f2937; font-size: 16px; margin-top: 30px;">Un fuerte abrazo,</p>
                        <p style="color: #1f2937; font-size: 16px; font-weight: 600;">El equipo de Gestión de Prácticas</p>
                    </div>
                </div>
            `;
            case Estado_informe.DESAPROBADA:
                return `
                <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); padding: 20px;">
                        <h2 style="color: #1f2937; font-size: 18px; font-weight: 600;">Hola ${nombreAlumno},</h2>
                        <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                            Queremos informarte que tu informe ha sido <strong>DESAPROBADO</strong>. 
                        </p>
                        <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                            Sabemos que no es la noticia que esperabas, pero queremos animarte a seguir adelante y trabajar en los aspectos pendientes. Puedes contactar con tu academico para resolver dudas.
                        </p>
                        <p style="color: #1f2937; font-size: 16px; font-weight: 600;">El equipo de Gestión de Prácticas</p>
                    </div>
                </div>
            `;
            case Estado_informe.CORRECCION:
                return `
                <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); padding: 20px;">
                        <h2 style="color: #1f2937; font-size: 18px; font-weight: 600;">Hola ${nombreAlumno},</h2>
                        <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                            Tu informe ha sido revisado y está en estado de <strong>CORRECCIÓN</strong>.
                        </p>
                        <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                            Te invitamos a ingresar al sistema para revisar la corrección y los comentarios que te dejó tu académico. 

                        <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                            ¡Estamos seguros de que con algunos ajustes tu informe quedará perfecto!
                        </p>
                        <p style="color: #1f2937; font-size: 16px; margin-top: 30px;">Mucho ánimo,</p>
                        <p style="color: #1f2937; font-size: 16px; font-weight: 600;">El equipo de Gestión de Prácticas</p>
                    </div>
                </div>
            `;
            default:
                return `
                <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); padding: 20px;">
                        <h2 style="color: #1f2937; font-size: 18px; font-weight: 600;">Hola ${nombreAlumno},</h2>
                        <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                            Hay una actualización sobre tu informe. Por favor, revisa el sistema para más detalles.
                        </p>
                        <p style="color: #1f2937; font-size: 16px; margin-top: 30px;">Saludos cordiales,</p>
                        <p style="color: #1f2937; font-size: 16px; font-weight: 600;">El equipo de Gestión de Prácticas</p>
                    </div>
                </div>
            `;
        }
    }


    public async notificacionCreacionCuenta(id_alumno: number) {
        try {
            // Obtener datos del alumno
            const alumno = await this._databaseService.usuarios.findUnique({
                where: { id_usuario: id_alumno },
            });

            if (!alumno) {
                throw new Error(`No se encontró un alumno con el ID ${id_alumno}`);
            }

            // Extraer los primeros 8 dígitos del RUT
            const contrasenaTemporal = alumno.rut.substring(0, 8);
            const correoInstitucional = alumno.correo;

            // Generar el correo
            const emailAlumno: SendEmailDto = {
                recipients: [correoInstitucional],
                subject: `Creación de su cuenta en el Sistema de Gestión de Prácticas`,
                html: `
                <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); padding: 20px;">
                        <h2 style="color: #1f2937; font-size: 18px; font-weight: 600;">Hola ${alumno.nombre},</h2>
                        <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                            Nos complace informarle que su cuenta ha sido creada exitosamente en el <strong>Sistema de Gestión de Prácticas</strong>.
                        </p>
                        <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                            A continuación, le proporcionamos los detalles para acceder al sistema:
                        </p>
                        <ul style="color: #374151; font-size: 16px; margin-top: 20px;">
                            <li><strong>Correo institucional:</strong> ${correoInstitucional}</li>
                            <li><strong>Contraseña temporal:</strong> ${contrasenaTemporal}</li>
                        </ul>
                        <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                            Por motivos de seguridad, le solicitamos que inicie sesión y cambie su contraseña a la brevedad.
                        </p>
                        <p style="color: #1f2937; font-size: 16px; margin-top: 30px;">Saludos cordiales,</p>
                        <p style="color: #1f2937; font-size: 16px; font-weight: 600;">El equipo de Gestión de Prácticas</p>
                    </div>
                </div>
            `,
            };

            // Llamar al servicio de envío de correos
            await this._mailService.sendEmail(emailAlumno);

            console.log('Correo de creación de cuenta enviado exitosamente.');
        } catch (error) {
            console.error('Error al enviar la notificación de creación de cuenta:', error.message);
        }
    }


    public async notificacionCorreccionInforme(id_alumno: number, id_informe: number) {
        try {
            // Obtener datos del alumno
            const alumno = await this._databaseService.usuarios.findUnique({
                where: { id_usuario: id_alumno },
            });

            if (!alumno) {
                throw new Error(`No se encontró un alumno con el ID ${id_alumno}`);
            }

            // Obtener datos del informe
            const informe = await this._databaseService.informesAlumno.findUnique({
                where: { id_informe: id_informe },
                include: { academico: { include: { usuario: true } } },
            });

            if (!informe || !informe.academico) {
                throw new Error(`No se encontró un informe con el ID ${id_informe} o no tiene asignado un académico.`);
            }

            const correoInstitucional = alumno.correo;
            const academicoNombre = informe.academico.usuario.nombre;

            // Generar el correo
            const emailAlumno: SendEmailDto = {
                recipients: [correoInstitucional],
                subject: `Su informe ha sido corregido`,
                html: `
                <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); padding: 20px;">
                        <h2 style="color: #1f2937; font-size: 18px; font-weight: 600;">Hola ${alumno.nombre},</h2>
                        <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                            Le informamos que el académico <strong>${academicoNombre}</strong> ha subido la corrección de su informe.
                        </p>
                        <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                            Por favor, revise la retroalimentación y realice las modificaciones necesarias en el sistema.
                        </p>
                        <p style="color: #1f2937; font-size: 16px; margin-top: 30px;">Saludos cordiales,</p>
                        <p style="color: #1f2937; font-size: 16px; font-weight: 600;">El equipo de Gestión de Prácticas</p>
                    </div>
                </div>
            `,
            };

            // Llamar al servicio de envío de correos
            await this._mailService.sendEmail(emailAlumno);

            console.log('Correo de corrección de informe enviado exitosamente.');
        } catch (error) {
            console.error('Error al enviar la notificación de corrección de informe:', error.message);
        }
    }


    public async notificacionRestablecimientoContrasena(id_usuario: number) {
        try {
            // Obtener datos del usuario
            const usuario = await this._databaseService.usuarios.findUnique({
                where: { id_usuario },
            });

            if (!usuario) {
                throw new Error(`No se encontró un usuario con el ID ${id_usuario}`);
            }

            const correoInstitucional = usuario.correo;
            const nuevaContrasena = usuario.rut.substring(0, 8); // La contraseña que se genera

            // Generar el correo
            const emailUsuario: SendEmailDto = {
                recipients: [correoInstitucional],
                subject: `Su contraseña ha sido restablecida`,
                html: `
            <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); padding: 20px;">
                    <h2 style="color: #1f2937; font-size: 18px; font-weight: 600;">Hola ${usuario.nombre},</h2>
                    <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                        Le informamos que su contraseña ha sido restablecida exitosamente.
                    </p>
                    <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                        Su nueva contraseña es: <strong>${nuevaContrasena}</strong>
                    </p>
                    <p style="color: #374151; font-size: 16px; margin-top: 20px;">
                        Le recomendamos cambiar esta contraseña inmediatamente después de iniciar sesión.
                    </p>
                    <p style="color: #1f2937; font-size: 16px; margin-top: 30px;">Saludos cordiales,</p>
                    <p style="color: #1f2937; font-size: 16px; font-weight: 600;">El equipo de Gestión de Prácticas</p>
                </div>
            </div>
        `,
            };

            // Llamar al servicio de envío de correos
            await this._mailService.sendEmail(emailUsuario);

            console.log('Correo de restablecimiento de contraseña enviado exitosamente.');
        } catch (error) {
            console.error('Error al enviar la notificación de restablecimiento de contraseña:', error.message);
        }
    }

}
