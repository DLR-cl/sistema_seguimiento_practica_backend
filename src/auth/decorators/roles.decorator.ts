import { SetMetadata } from "@nestjs/common";
import { Tipo_usuario } from "@prisma/client";
import { PUBLIC_KEY } from "src/constants/key-decorators";

export const PublicAccess = () => SetMetadata(PUBLIC_KEY, true)
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Tipo_usuario[]) => SetMetadata(ROLES_KEY, roles); 