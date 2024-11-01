import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '../database/database/database.service';
import { UsersService } from 'src/users/users.service';
import { constants } from 'buffer';
import { jwtConstants } from './libs/constants';
import { AuthGuard } from './guards/auth.guard';


@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      secretOrPrivateKey: jwtConstants.secret,
      signOptions: { expiresIn: '60s'}
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, DatabaseService, UsersService, AuthGuard],
})
export class AuthModule {}
