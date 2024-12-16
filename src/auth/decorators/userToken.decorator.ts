import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export const UserFromToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Encabezado Authorization no encontrado');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'TU_SECRETO_JWT');
      return decoded; // Devuelve el payload decodificado
    } catch (err) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  },
);
