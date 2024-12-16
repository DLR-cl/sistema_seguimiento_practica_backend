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
  ) {}

  async signIn(authLoginDto: AuthLoginDto) {
    try {
      const user = await this._usuarioService.findUserByEmail(authLoginDto.correo);

      if (!user || !(await compare(authLoginDto.password, user.password))) {
        throw new UnauthorizedException('Contraseña o Correo inválidos');
      }

      // Generar el token JWT
      const payload = { id: user.id_usuario, correo: user.correo, rol: user.tipo_usuario };
      const access_token = await this._jwtService.signAsync(payload, { secret: jwtConstants.secret });

      if (user.primerSesion) {
        // Respuesta directa si es el primer inicio de sesión
        return {
          message: 'Primer inicio de sesión. Por favor, cambie su contraseña.',
          access_token,
          primerInicioSesion: true,
        };
      }

      // Respuesta de inicio de sesión exitoso
      return {
        message: 'Inicio de sesión exitoso',
        access_token,
        primerInicioSesion: false,
      };
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Error interno al hacer login');
    }
  }
}
