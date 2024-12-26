import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database/database.service';
import { AuthLoginDto } from './dto/authLoginDto.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../modules/users/users.service';
import { jwtConstants } from './libs/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usuarioService: UsersService,
    private readonly _jwtService: JwtService,
    private readonly _databaseService: DatabaseService,
  ) { }

async signIn(authLoginDto: AuthLoginDto) {
  try {
    // Buscar usuario por correo
    const user = await this._usuarioService.findUserByEmail(authLoginDto.correo);

    if (!user) {
      // Si no es usuario, buscar en administradores
      const admin = await this._databaseService.administrador.findUnique({
        where: { correo: authLoginDto.correo },
      });

      if (!admin || !(await compare(authLoginDto.password, admin.password))) {
        throw new UnauthorizedException('Contraseña o correo incorrectos');
      }

      // Generar token para administrador
      return this.generateLoginResponse(admin, 'Administrador');
    }

    // Validar la contraseña del usuario
    if (!(await compare(authLoginDto.password, user.password))) {
      throw new UnauthorizedException('Contraseña o correo incorrectos');
    }

    // Generar token para usuario
    return this.generateLoginResponse(user, 'Usuario');
  } catch (error) {
    // Manejo de errores
    throw error instanceof HttpException
      ? error
      : new InternalServerErrorException('Error interno al hacer login');
  }
}

private async generateLoginResponse(entity: any, role: string) {
  const payload = {
    id_usuario: entity.id_usuario || entity.id,
    correo: entity.correo,
    rol: entity.tipo_usuario,
    nombre: entity.nombre,
  };

  const access_token = await this._jwtService.signAsync(payload, { secret: jwtConstants.secret });

  // Respuesta para primer inicio de sesión
  if (entity.primerSesion) {
    return {
      message: `Primer inicio de sesión para ${role}. Por favor, cambie su contraseña.`,
      access_token,
      primerInicioSesion: true,
    };
  }

  // Respuesta de inicio de sesión exitoso
  return {
    message: `Inicio de sesión exitoso para ${role}.`,
    access_token,
    primerInicioSesion: false,
  };
}

}
