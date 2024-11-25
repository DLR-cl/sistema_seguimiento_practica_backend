import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailerService } from '@nestjs-modules/mailer';
import { mailConstant } from 'src/constants/email.constant';
import { Cron, CronExpression } from "@nestjs/schedule";
import { SendEmailDto } from './dto/mail.dto';
@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService
    ){}

    emailTransport(){
        const tranporter = nodemailer.createTransport({
            host: mailConstant.mail_host,
            port: Number(mailConstant.mail_port),
            secure: false,
            auth: {
                user: mailConstant.mail_user,
                pass: mailConstant.mail_password,
            },
        })
        return tranporter;
    }


    async sendMail(){
        try {
            console.log('correo enviado')
            await this.mailerService.sendMail({
                to: 'juan.yampara.rojas@alumnos.uta.cl',
                from: '"Bienvenido al club de la comedia" <yampara64@gmail.com>',
                subject: 'Test',
                text: '',
                html: '<p>Mensaje de test para el sistema de correo </p>',
            });
            return {
                success: true,
            }
        } catch(error){
            return {
                success: false,
            }
        }
    }

    async sendEmail(dto: SendEmailDto){}
}

