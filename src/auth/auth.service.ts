import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database/database.service';
import { AuthLoginDto } from './dto/authLoginDto.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../modules/users/users.service';
import { jwtConstants } from './libs/constants';
import { Response } from 'express';


@Injectable()
export class AuthService {
    constructor(
        private readonly _usuarioService: UsersService,
        private readonly _jwtService: JwtService,
        private readonly _databaseService: DatabaseService,
    ){}


    async signIn(authLoginDto: AuthLoginDto, res: Response) {
      try {
        const user = await this._usuarioService.findUserByEmail(authLoginDto.correo);
  
        if (!user || !(await compare(authLoginDto.password, user.password))) {
          throw new UnauthorizedException('Contraseña o Correo inválidos');
        }
  
        if (user.primerSesion) {
          // Respuesta directa si es el primer inicio de sesión
          return res.status(200).send({
            message: 'Primer inicio de sesión. Por favor, cambie su contraseña.',
            primerInicioSesion: true,
          });
        }
  
        // Generar el token JWT
        const payload = { id: user.id_usuario, correo: user.correo, rol: user.tipo_usuario };
        const access_token = await this._jwtService.signAsync(payload, { secret: jwtConstants.secret });
  
        // Configurar la cookie
        res.cookie('access_token', access_token, {
          httpOnly: true, // No accesible desde JavaScript // 
          secure: false, // process.env.NODE_ENV === 'production', // Solo en HTTPS cambiar a false si es local
          sameSite: 'lax', // Prevenir CSRF // cambiar a lax para local y strict para afuera
          maxAge: 1000 * 60 * 60 * 24, // 1 día
        });
  
        return res.status(200).send({ message: 'Inicio de sesión exitoso' });
      } catch (error) {
        throw error instanceof HttpException ? error : new InternalServerErrorException('Error interno al hacer login');
      }
    }


}
