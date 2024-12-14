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

  @Post()
  async hola(@Body() data: {
    id_informe: number,
    estado: Estado_informe
  }){
    return this.mailService.notificacionCambioEstado(data.id_informe, data.estado);
  }
}
