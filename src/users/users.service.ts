import { BadRequestException, HttpCode, HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database/database.service';
import { AuthRegisterDto } from 'src/auth/dto/authRegisterDto.dto';
import { encrypt } from '../auth/libs/bcryp';
import { compare } from 'bcrypt';
import { AuthLoginDto } from 'src/auth/dto/authLoginDto.dto';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class UsersService {

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly _jwtService: JwtService) {
  }
  async loginUser(authLoginDto: AuthLoginDto) {
    try {
      const userExiste = await this.findUser(authLoginDto.correo);
      if (!userExiste) {
        throw new BadRequestException('Error, no existe un usuario con ese correo');
      }

      const user = await this.databaseService.usuario.findUnique({
        where: { correo: authLoginDto.correo, }
      }
      );

      const isPasswordMatch = await compare(authLoginDto.password, user.password);
      if (!isPasswordMatch) {
        throw new BadRequestException('Contraseña inválida.');
      };

      console.log("funciono bien");
      return user;

    }
    catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new InternalServerErrorException('Error al hacer log in');
    }
  }

  async signUp(authRegister: AuthRegisterDto) {
    try {
      if (!this.findUser(authRegister.correo)) {
        throw new HttpException('El usuario ya existe', HttpStatus.BAD_GATEWAY);
      };

      // hashear la contraseña
      const hashedPassword = await encrypt(authRegister.password);

      // toma los datos necesarios del authregister
      const newUser = await this.databaseService.usuario.create({
        data: {
          ...authRegister,
          password: hashedPassword,
        },
      });

      const { password: _, ...userWithoutPassword } = newUser;


      return newUser;


    } catch (error) {
      throw error;
    }


  }

  private async findUser(email: string) {
    try {
      const user = await this.databaseService.usuario.findUnique({
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
