import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    // Verificar si la ruta es pública
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) {
      return true;
    }

    // Obtener el token del encabezado Authorization
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Encabezado de autorización no encontrado.');
    }

    const token = authHeader.split(' ')[1]; // Formato esperado: "Bearer <token>"
    if (!token) {
      throw new UnauthorizedException('Token no encontrado en el encabezado.');
    }

    try {
      // Validar el token y extraer el payload
      const payload = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SECRET });
      req['user'] = payload; // Agregar el payload al objeto request

      // Verificar si es el primer inicio de sesión
      if (payload.primerSesion) {
        const handler = context.getHandler();
        const routeName = handler.name; // Nombre de la función del controlador

        // Permitir solo la ruta específica para cambiar contraseña
        if (routeName !== 'changePassword') {
          throw new ForbiddenException('Debe cambiar su contraseña antes de continuar.');
        }
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }
}
