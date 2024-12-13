import { IsNotEmpty, IsSemVer, IsString } from "class-validator";

export class CrearDimensionDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsNotEmpty()
    @IsString()
    descripcion: string;
}

export class CrearSubDimensionDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsNotEmpty()
    @IsString()
    descripcion: string;
    
    @IsNotEmpty()
    @IsString()
    idDimensionPadre: number;
}