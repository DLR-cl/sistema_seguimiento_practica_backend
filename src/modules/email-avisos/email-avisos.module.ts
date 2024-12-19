import { Module } from '@nestjs/common';
import { EmailAvisosService } from './email-avisos.service';
import { MailModule } from '../../mail/mail.module';
import { DatabaseModule } from '../../database/database/database.module';

@Module({
  providers: [EmailAvisosService],
  imports: [MailModule, DatabaseModule],
  exports: [EmailAvisosService]
})
export class EmailAvisosModule {}
