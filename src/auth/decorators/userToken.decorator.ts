import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Custom exception for reusability
class TokenException extends UnauthorizedException {
  constructor(message: string) {
    super(message || 'Token inválido o expirado');
  }
}

export const UserFromToken = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Verificar que el encabezado Authorization existe
    if (!authHeader) {
      throw new TokenException('Encabezado Authorization no encontrado');
    }

    // Validar que el token esté en formato Bearer
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new TokenException('Token no proporcionado o formato incorrecto');
    }

    try {
      // Utilizar JwtService para verificar el token
      const jwtService = new JwtService({ secret: process.env.JWT_SECRET || 'TU_SECRETO_JWT' });
      const decoded = jwtService.verify(token);

      return decoded; // Devuelve el payload decodificado
    } catch (err) {
      throw new TokenException(err.message);
    }
  },
);
