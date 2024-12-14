import { Estado_informe } from "@prisma/client";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class AprobacionInformeDto {
    @IsNotEmpty()
    @Min(0)
    id_informe: number;

    @IsNumber()
    @IsNotEmpty()
    id_academico: number;

    @IsEnum([Estado_informe.APROBADA, Estado_informe.DESAPROBADA, Estado_informe.CORRECCION],
        {
            message: 'El estado de aprobacion solo puede ser APROBADA, DESAPROBADA o CORRECCION'
        }
    )
    @IsNotEmpty()
    estado: Estado_informe;
}

export class Comentario {
    @IsNotEmpty()
    @IsString()
    @MaxLength(300, {
        message: 'El comentario excede el limite de $constraint1 caracteres, largo del comentario $value caracteres',
    })
    comentario: string;
    @IsNotEmpty()

    @Min(0)
    id_informe: number;
    @IsNotEmpty()

    @Min(0)
    id_usuario: number; // tiene que ser academico
}

