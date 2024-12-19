import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Tipo_usuario } from "@prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorator";
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector){

    }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Tipo_usuario[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if(!requiredRoles){
            return true;
        }

        const  { user } = context.switchToHttp().getRequest();
        return requiredRoles.some((role) => user.roles?.includes(role)); 
    }
}