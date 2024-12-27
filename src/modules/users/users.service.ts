import { BadRequestException, HttpCode, HttpException, HttpStatus, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../database/database/database.service';
import { AuthRegisterDto } from '../../auth/dto/authRegisterDto.dto';
import { encrypt } from '../../auth/libs/bcryp';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { isRole } from '../../utils/user.roles';
import { Tipo_usuario, TipoPractica } from '@prisma/client';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';


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
      }
  
      if (!isRole(authRegister.tipo_usuario)) {
        throw new BadRequestException('Rol inválido');
      }
  
      // Generar contraseña predeterminada y hashear
      const password = authRegister.rut.substring(0, 8);
      const hashedPassword = await encrypt(password);
  
      const newUser = await this.databaseService.usuarios.create({
        data: {
          ...authRegister,
          password: hashedPassword,
        },
      });
  
      const { password: _, ...userWithoutPassword } = newUser;
  
      return userWithoutPassword;
    } catch (error) {
      throw error instanceof HttpException ? error : new InternalServerErrorException('Error interno al crear un usuario');
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

      return user;
    } catch (error) {
      if(error instanceof BadRequestException){
        throw error;
      }
    }
  }

  public async findUserByEmail(correo: string){
    const user = await this.databaseService.usuarios.findUnique({
      where: {
        correo: correo,
      }
    });
    return user;
  }
  public async obtenerUsuario(id: number){
    try {
      const user = await this.databaseService.usuarios.findUnique({
        where:{ 
          id_usuario: id,
        },
        select: {
          nombre: true,
          rut: true,
          id_usuario: true,
          correo: true,
          tipo_usuario: true,
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
        },
        select: {
          nombre: true,
          rut: true,
          id_usuario: true,
          correo: true,
          tipo_usuario: true,
        }
      })
      return usuarios;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  //hola
  public async obtenerSecretarias(){
    try {
      const usuarios = await this.databaseService.usuarios.findMany({
        where: {
          tipo_usuario: {
            in: [
              Tipo_usuario.SECRETARIA_CARRERA, Tipo_usuario.JEFE_DEPARTAMENTO
            ]
          },
        },
        select: {
          nombre: true,
          rut: true,
          id_usuario: true,
          correo: true,
          tipo_usuario: true,
        }
      })
      return usuarios;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async changeAdminPassword(adminId: number, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;

    // Obtener administrador
    const admin = await this.databaseService.administrador.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException('Administrador no encontrado');
    }

    // Validar contraseña actual
    const isPasswordMatch = await compare(oldPassword, admin.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('La contraseña actual no es correcta');
    }

    // Hashear la nueva contraseña
    const hashedPassword = await encrypt(newPassword);

    // Actualizar la contraseña y marcar como no primer inicio de sesión
    await this.databaseService.administrador.update({
      where: { id: adminId },
      data: {
        password: hashedPassword,
        primerSesion: false, // Ya no necesita cambiar contraseña
      },
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;

    const user = await this.databaseService.usuarios.findUnique({
      where: { id_usuario: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isPasswordMatch = await compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('La contraseña actual no es correcta');
    }

    const hashedPassword = await encrypt(newPassword);

    await this.databaseService.usuarios.update({
      where: { id_usuario: userId },
      data: {
        password: hashedPassword,
        primerSesion: false,
      },
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  
}
