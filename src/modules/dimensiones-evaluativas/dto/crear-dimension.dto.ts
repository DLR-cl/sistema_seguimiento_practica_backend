import { IsNotEmpty, IsSemVer, IsString } from "class-validator";

export class CrearDimensionDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsNotEmpty()
    @IsString()
    descripcion: string;
}