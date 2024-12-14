import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Estado_informe } from '@prisma/client';
import { EmailAvisosService } from './modules/email-avisos/email-avisos.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly mailService: EmailAvisosService) {
    
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }


}
