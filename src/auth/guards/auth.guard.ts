import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private jwtService: JwtService){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);

        console.log(token);
        if(!token){
            throw new UnauthorizedException('No tiene permisos para acceder');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
            });
            console.log(payload);
        } catch(error){
            throw new UnauthorizedException();
        }

        return true;
    }

    private extractToken(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];

        return type=== 'Bearer' ? token: undefined;
    }
}