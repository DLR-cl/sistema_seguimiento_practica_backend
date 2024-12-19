import { TipoEmpresa } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class createEmpresasDto {
    
    @IsString()
    @IsNotEmpty()
    nombre_razon_social: string;

    @IsString()
    @IsNotEmpty()
    ubicacion: string;

    @IsString()
    @IsNotEmpty()
    rubro: string;
    
    @IsEnum(TipoEmpresa)
    @IsNotEmpty()
    caracter_empresa: TipoEmpresa;

    @IsString()
    @IsNotEmpty()
    tamano_empresa: string;

}