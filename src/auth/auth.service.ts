import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database/database.service';
import { AuthLoginDto } from './dto/authLoginDto.dto';
import { AuthRegisterDto } from './dto/authRegisterDto.dto';
import { encrypt } from './libs/bcryp';
import { ResponseDto } from './dto/response.dto';
import { Tipo_usuario } from '@prisma/client';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { resolveObjectURL } from 'buffer';
import { UsersService } from '../modules/users/users.service';
import { jwtConstants } from './libs/constants';
import { decrypt } from 'dotenv';

@Injectable()
export class AuthService {
    constructor(
        private readonly _usuarioService: UsersService,
        private readonly _jwtService: JwtService,
        private readonly _databaseService: DatabaseService,
    ){}

  
    async signIn(authLoginDto: AuthLoginDto){

            try {
                const userExists = await this.findUser(authLoginDto.correo);
                if(!userExists){
                  console.log("mal correo")
                    throw new BadRequestException('Error, contraseña o correo inválido');
                }
                const user = await this._databaseService.usuarios.findUnique({
                    where: { correo: authLoginDto.correo }
                });


                const isPasswordMatch = await compare(authLoginDto.password, user.password);

                if(!isPasswordMatch){
                    throw new UnauthorizedException('Contraseña o Correo Inválidos');
                };

                
                const { password: _, ...userWithoutPassword } = user;
                const payload = { ...userWithoutPassword };
                const access_token = await this._jwtService.signAsync(payload, {secret: jwtConstants.secret });

                return { access_token };

            } catch(error){
                if(error instanceof BadRequestException){
                  console.log(error);
                  throw error;
                }else if(error instanceof UnauthorizedException){
                  throw error;
                }else{
                  throw new InternalServerErrorException('Error interno al hacer login');
                }

            }

    }

    private async findUser(email: string) {
          const user = await this._databaseService.usuarios.findUnique({
            where: {
              correo: email,
            }
          });

          return user;
        }
}
