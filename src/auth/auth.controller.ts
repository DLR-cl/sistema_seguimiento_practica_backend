import { Body, Controller,HttpCode,HttpStatus,Post, Res } from '@nestjs/common';
import { AuthRegisterDto } from './dto/authRegisterDto.dto';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/authLoginDto.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService){}
    @Post('login')
    async signIn(@Body() authLoginDto: AuthLoginDto, @Res() res: Response) {
      return this.authService.signIn(authLoginDto, res);
    }
}
