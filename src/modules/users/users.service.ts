import { BadRequestException, HttpCode, HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../database/database/database.service';
import { AuthRegisterDto } from 'src/auth/dto/authRegisterDto.dto';
import { encrypt } from '../../auth/libs/bcryp';
import { compare } from 'bcrypt';
import { AuthLoginDto } from 'src/auth/dto/authLoginDto.dto';
import { JwtService } from '@nestjs/jwt';
import { isRole } from 'src/utils/user.roles';
import { Tipo_usuario, TipoPractica } from '@prisma/client';
import { CreateUsuarioDto } from './dto/create-usuario.dto';


@Injectable()
export class UsersService {

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly _jwtService: JwtService) {
  }

  async signUp(authRegister: AuthRegisterDto) {
    try {
      console.log(authRegister);
      if (await this.findUser(authRegister.correo)) {
        throw new BadRequestException('Ya existe cuenta con ese correo');
      };

      if(!isRole(authRegister.tipo_usuario)){
        throw new BadRequestException('Rol inválido')
      }
      // hashear la contraseña: que es los primeros 8 digitos del rut sin puntos
      const password = authRegister.rut.substring(0,8);
      console.log(password)
      const hashedPassword = await encrypt(password);
      console.log(hashedPassword);
      // toma los datos necesarios del authregister
      const newUser = await this.databaseService.usuarios.create({
        data: {
          ...authRegister,
          password: hashedPassword,
        },
      });

      const { password: _, ...userWithoutPassword } = newUser;

      return newUser;


    } catch (error) {
      console.log(error);
      if(error instanceof BadRequestException){
        throw error;
      }
      throw new InternalServerErrorException('Error interno al crear un usuario');
    }


  }

  private async findUser(email: string) {
    try {
      const user = await this.databaseService.usuarios.findUnique({
        where: {
          correo: email,
        }
      });
      if(!user){
        return false;
      }
      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }

    }
  }

  public async findUsuario(id_user: number){
    try {
      const user = await this.databaseService.usuarios.findUnique({
        where: {
          id_usuario: id_user,
        }
      });

      if(!user){
        return false;
      }
      return true;
    } catch (error) {
      if(error instanceof BadRequestException){
        throw error;
      }
    }
  }

  public async obtenerUsuario(id: number){
    try {
      const user = await this.databaseService.usuarios.findUnique({
        where:{ 
          id_usuario: id,
        }
      })
      return user;
    } catch (error) {
      throw error;
    }
  }

  public async obtenerUsuariosByRol(rol: Tipo_usuario){
    try {
      const usuarios = await this.databaseService.usuarios.findMany({
        where: {
          tipo_usuario: rol,
        }
      })
      return usuarios;
    } catch (error) {
      throw error;
    }
  }
}
