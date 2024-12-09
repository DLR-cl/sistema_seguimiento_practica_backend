import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database/database.service';
import { CreateAcademicoDto } from './dto/create-academicos.dto';
import { access } from 'fs';
import { PrismaClient } from '@prisma/client';
import { CantidadInformesPorAcademico } from './dto/cantidad-informes.dto';
import { obtenerCantidadInformes } from '@prisma/client/sql'
@Injectable()
export class AcademicosService {
    constructor(
        private readonly _databaseService: DatabaseService,
    ){

    }

    public async crearAcademico(academico: CreateAcademicoDto){
        try {
            const usuario = await this._databaseService.usuarios.create({
                data: {...academico},
            });

            const nuevoAcademico = await this._databaseService.academico.create({
                data: {
                    id_user: usuario.id_usuario,
                }
            });

            return "gola";

        }catch(error){
            if(error instanceof BadRequestException){
                throw error;
            }
        }
    };

    public async existeAcademico(id_academico: number){
        const academico = await this._databaseService.academico.findUnique({
            where: {
                id_user: id_academico,
            }
        });

        if(academico!){
            return false;
        }
        return true;  
    }

    public async cantidadInformesPorAcademico(){
        try {
            const resultados = await this._databaseService.$queryRawTyped<CantidadInformesPorAcademico>(obtenerCantidadInformes())
            const datosConvertidos = resultados.map((resultado) => ({
                ...resultado,
                cantidad_informes: Number(resultado.cantidad_informes),
            }));

            return datosConvertidos;
        } catch (error) {
            throw error;
        }
    }
}
