import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailerService } from '@nestjs-modules/mailer';
import { mailConstant } from 'src/constants/email.constant';
import { Cron, CronExpression } from "@nestjs/schedule";
import { SendEmailDto } from './dto/mail.dto';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class MailService {

    constructor(
        private readonly _configService: ConfigService,
    ){}
    emailTransport(){
        const tranporter = nodemailer.createTransport({
            host: this._configService.get<string>('MAIL_HOST'),
            port: this._configService.get<number>('MAIL_PORT'),
            secure: false,
            auth: {
                user: this._configService.get<string>('MAIL_USER'),
                pass: this._configService.get<string>('MAIL_PASSWORD'),
            },
            tls: {rejectUnauthorized: false},
            logger: true,
            debug: true,
        })
        return tranporter;
    }


    async sendEmail(dto: SendEmailDto){
        const { recipients, subject, html } = dto;

        const transport = this.emailTransport();

        const options: nodemailer.SendMailOptions = {
            from: this._configService.get<string>('MAIL_USER'),
            to: recipients,
            subject: subject,
            html: html,
        };

        try {
            await transport.sendMail(options);
            console.log('correo enviado con exito')
        } catch (error) {
            console.log('Correo no enviado', error);
        }
    }
}

