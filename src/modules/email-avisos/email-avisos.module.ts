import { Module } from '@nestjs/common';
import { EmailAvisosService } from './email-avisos.service';
import { MailModule } from 'src/mail/mail.module';
import { DatabaseModule } from 'src/database/database/database.module';

@Module({
  providers: [EmailAvisosService],
  imports: [MailModule, DatabaseModule],
  exports: [EmailAvisosService]
})
export class EmailAvisosModule {}
