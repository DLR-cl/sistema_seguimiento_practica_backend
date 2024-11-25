import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendEmailDto } from './dto/mail.dto';

@Controller('mail')
export class MailController {
    constructor(
        private readonly _mailService: MailService
    ){}

    @Post('send')
    async sendEmail(@Body() dto: SendEmailDto){
        await this._mailService.sendEmail(dto);
        
        return {
            message: 'Email enviado',
        }
    }
}
