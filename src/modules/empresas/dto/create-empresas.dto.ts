import { TipoEmpresa } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class createEmpresasDto {
    
    @IsString()
    @IsNotEmpty()
    nombre_razon_social: string;

    @IsString()
    @IsNotEmpty()
    ubicacion: string;

    @IsString()
    @IsOptional()
    rubro?: string;
    
    @IsEnum(TipoEmpresa)
    @IsOptional()
    caracter_empresa?: TipoEmpresa;

    @IsString()
    @IsOptional()
    tamano_empresa?: string;

}