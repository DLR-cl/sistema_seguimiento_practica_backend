import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

import { DatabaseModule } from '../../database/database/database.module';
import { EmailAvisosModule } from 'modules/email-avisos/email-avisos.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
  imports: [DatabaseModule, EmailAvisosModule]
})
export class UsersModule {}
