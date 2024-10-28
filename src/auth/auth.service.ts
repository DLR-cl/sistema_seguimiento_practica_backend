import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database/database.service';
import { AuthLoginDto } from './dto/authLoginDto.dto';
import { AuthRegisterDto } from './dto/authRegisterDto.dto';
import { encrypt } from './libs/bcryp';
import { ResponseDto } from './dto/response.dto';
import { Tipo_usuario } from '@prisma/client';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly jtwService: JwtService
    ){}

    async loginUser(authLoginDto: AuthLoginDto){
        try{
            if(!this.findUser(authLoginDto.email)){
                throw new HttpException('Error, no existe un usuario con ese correo', HttpStatus.BAD_REQUEST);
            }

            const user = await this.databaseService.usuario.findUnique({
                where:{ correo: authLoginDto.email, }
                }
            );

            const isPasswordMatch = await compare(authLoginDto.password, user.password);
            if(!isPasswordMatch){
                throw new BadRequestException('Contraseña inválida.');
            };

            const { password:_, ...userWithoutPassword } = user;
            
            const payload = { ...userWithoutPassword };

            const access_token = await this.jtwService.signAsync(payload);
            return { access_token };

        }
        catch(error){
            throw new HttpException('Error al autenticar usuario', HttpStatus.BAD_REQUEST);
        }
    }


    async signUp(authRegister: AuthRegisterDto){
        try{
            if(this.findUser(authRegister.correo)){
                throw new HttpException('El usuario ya existe', HttpStatus.BAD_GATEWAY);
            };

            // hashear la contraseña
            const hashedPassword = await encrypt(authRegister.password);

            const newUser = await this.databaseService.usuario.create({
                data: {
                    ...authRegister,
                    password: hashedPassword,
                },
            });

            const {password: _, ...userWithoutPassword } = newUser;

            const responseDto: ResponseDto = {
                message: 'Usuario Creado con éxito',
                status_code: HttpStatus.OK,
                data: userWithoutPassword,
            };
            
            return responseDto;


        } catch (error){
            throw new HttpException('Error al crear el usuario', HttpStatus.BAD_REQUEST);
        }
    }

    private async findUser(email: string){
        const user = await this.databaseService.usuario.findUnique({
            where:{
                correo: email,
            }
        });
        if(!user){
            return false;
        }
        return true;
    }
}
