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
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly _usuarioService: UsersService,
        private readonly _jwtService: JwtService,
        private readonly _databaseService: DatabaseService,
    ){}

  


    async signUp(authRegister: AuthRegisterDto){
        return this._usuarioService.signUp(authRegister);
    }

    async signIn(authLoginDto: AuthLoginDto){

            try {
                const userExists = await this.findUser(authLoginDto.correo);
                if(!userExists){
                    throw new BadRequestException('Error, no existe usuario');
                }

                const user = await this._databaseService.usuarios.findUnique({
                    where: { correo: authLoginDto.correo }
                });

                const isPasswordMatch = await compare(authLoginDto.password, user.password);

                if(!isPasswordMatch){
                    throw new BadRequestException('Contraseña o correo invalido');
                };

                
                const { password: _, ...userWithoutPassword } = user;

                const payload = { ...userWithoutPassword };
                console.log(payload, "soy el payload");

                const access_token = await this._jwtService.signAsync(payload, {secret: process.env.SECRET_KEY});
                console.log(access_token);
                return { access_token };

            } catch(error){
                if(error instanceof BadRequestException){
                    throw new HttpException({
                      status: HttpStatus.BAD_REQUEST,
                      error: error.message,
                    },HttpStatus.BAD_REQUEST);
                }
                throw new InternalServerErrorException('Error interno al hacer login');
            }

    }

    private async findUser(email: string) {
        try {
          const user = await this._databaseService.usuarios.findUnique({
            where: {
              correo: email,
            }
          });
          return !!user;
        } catch (error) {
          if (error instanceof BadRequestException) {
            throw error
          }
    
        }
      }
}
