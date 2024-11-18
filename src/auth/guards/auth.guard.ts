import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/modules/users/users.service";
import { Reflector } from "@nestjs/core";
import { PUBLIC_KEY } from "src/constants/key-decorators";
import { useToken } from "src/utils/user.token";
import { IUseToken } from "../interfaces/auth.interface";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private jwtService: JwtService,
        private userSevice: UsersService,
        private reflector: Reflector,
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        
        const isPublic = this.reflector.get<boolean>(
            PUBLIC_KEY,
            context.getHandler() 
        );

        if(isPublic){
            return true;
        }

        const req = context.switchToHttp().getRequest<Request>();
        const token = req.headers['codrr_token'];
        
        if(!token || Array.isArray(token)){
            throw new UnauthorizedException('Token inválido');
        }

        const manageToken: IUseToken | string= useToken(token);
        if(typeof(manageToken) === 'string'){
            throw new UnauthorizedException(manageToken);
        }

        if(manageToken.isExpired){
            throw new UnauthorizedException('Token expirado');
        }

        const { id_usuario } = manageToken;

        const user = await this.userSevice.findUsuario(manageToken.id_usuario);
        if(!user){
            throw new UnauthorizedException('Usuario no existente');
        }

        
        // arreglar validación
        console.log(token);
        if(!token){
            throw new UnauthorizedException('No tiene permisos para acceder');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
            });
            req['user'] = payload;
            console.log(payload);
        } catch(error){
            throw error;
        }

        return true;
    }

    private extractToken(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];

        return type=== 'Bearer' ? token: undefined;
    }
}