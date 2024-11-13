import { IsNotEmpty, IsString } from "class-validator";

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

    @IsString()
    @IsNotEmpty()
    nombre_gerente: string;
    
}