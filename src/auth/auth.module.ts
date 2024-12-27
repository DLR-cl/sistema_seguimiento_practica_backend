import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '../database/database/database.service';
import { UsersService } from '../modules/users/users.service';
import { constants } from 'buffer';
import { jwtConstants } from './libs/constants';
import { AuthGuard } from './guards/auth.guard';
import { DatabaseModule } from '../database/database/database.module';


@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h'}
    }),
    DatabaseModule
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
