import { BadRequestException, HttpCode, HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../database/database/database.service';
import { AuthRegisterDto } from 'src/auth/dto/authRegisterDto.dto';
import { encrypt } from '../../auth/libs/bcryp';
import { compare } from 'bcrypt';
import { AuthLoginDto } from 'src/auth/dto/authLoginDto.dto';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class UsersService {

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly _jwtService: JwtService) {
  }

  async signUp(authRegister: AuthRegisterDto) {
    try {
      if (await this.findUser(authRegister.correo)) {
        throw new BadRequestException('Ya existe cuenta con ese correo');
      };

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

      console.log(newUser);
      const { password: _, ...userWithoutPassword } = newUser;

      return newUser;


    } catch (error) {
      if(error instanceof BadRequestException){
        throw error;
      }
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
}
