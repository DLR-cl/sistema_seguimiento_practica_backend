import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database/database.service';
import { AuthLoginDto } from './dto/authLoginDto.dto';
import { AuthRegisterDto } from './dto/authRegisterDto.dto';
import { encrypt } from './libs/bcryp';
import { ResponseDto } from './dto/response.dto';
import { Tipo_usuario } from '@prisma/client';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { resolveObjectURL } from 'buffer';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly _usuarioService: UsersService,
        private readonly _jwtService: JwtService
    ){}

  


    async signUp(authRegister: AuthRegisterDto){
        return this._usuarioService.signUp(authRegister);
    }

    async signIn(authLoginDto: AuthLoginDto){

            
            const user = await this._usuarioService.loginUser(authLoginDto);

            const { password: _, ...userWithoutPassword } = user;

            const payload = { ...userWithoutPassword };
            console.log(payload, "soy el payload");

            const access_token = await this._jwtService.signAsync(payload, {secret: process.env.SECRET_KEY});
            console.log(access_token);
            return { access_token };
    }
}
