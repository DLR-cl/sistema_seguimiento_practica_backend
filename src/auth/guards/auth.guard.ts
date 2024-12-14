import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/modules/users/users.service";
import { Reflector } from "@nestjs/core";
import { PUBLIC_KEY } from "src/constants/key-decorators";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar si la ruta es pública
    const isPublic = this.reflector.get<boolean>(
      PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();

    // Obtener el token desde las cookies
    const token = req.cookies['access_token']; // Requiere cookie-parser

    if (!token) {
      throw new UnauthorizedException('Token no encontrado en las cookies.');
    }

    // Validar el token
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      req['user'] = payload; // Agregar el payload decodificado al objeto request
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    // Obtener el usuario del payload
    const { id } = req['user'];

    const user = await this.userService.findUsuario(id);
    if (!user) {
      throw new UnauthorizedException('Usuario no existente.');
    }

    // Verificar si es el primer inicio de sesión
    if (user.primerSesion) {
      const handler = context.getHandler();
      const routeName = handler.name; // Nombre de la función del controlador

      // Permitir solo rutas específicas para cambio de contraseña
      if (routeName !== 'changePassword') {
        throw new ForbiddenException('Debe cambiar su contraseña antes de continuar.');
      }
    }

    return true;
  }
}
