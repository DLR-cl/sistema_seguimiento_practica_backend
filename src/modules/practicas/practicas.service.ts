import { BadRequestException, Injectable } from "@nestjs/common";
import { createPracticaDto } from "./dto/create-practicas.dto";
import { DatabaseService } from "src/database/database/database.service";
import { PracticaResponseDto } from "./dto/practica-response.dto";
import { AlumnoPracticaService } from "../alumno_practica/alumno_practica.service";
import { Estado_practica } from "@prisma/client";

@Injectable()
export class PracticasService {

    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _alumnoService: AlumnoPracticaService,
    ){}

    public async generarPractica(practica: createPracticaDto){
        try {
            // si ya existe una práctica definida
            if(this.hayPractica(practica)){
                throw new BadRequestException('Ya existe una práctica registrada con esos datos');
            };

            // si el alumno no está activo en ninguna práctica
            if(this._alumnoService.alumnoActivo(practica.id_alumno)!){
                throw new BadRequestException('El alumno no tiene activo la práctica');
            }
            
            // se cambia el tipo de práctica de acuerdo a cual tenga activo
            practica.tipo_practica = await this._alumnoService.alumnoActivo(practica.id_alumno);

            
            const nuevaPractica = await this._databaseService.practicas.create({
                data: {
                    ...practica,
                    estado: Estado_practica.CURSANDO
                },
            });

            const response: PracticaResponseDto = new PracticaResponseDto(nuevaPractica);
            
            return response;

        } catch(error){
            if(error instanceof BadRequestException){
                throw error
            }
        }
    }

    public async hayPractica(practica: createPracticaDto){
        const existePractica = await this._databaseService.practicas.findFirst({
            where:{
                id_alumno: practica.id_alumno,
                id_supervisor: practica.id_supervisor,
                tipo_practica: practica.tipo_practica,
                fecha_inicio: practica.fecha_inicio
            }
        });

        if(existePractica!){
            return true;
        }
        return false;
    }

    public async existePractica(id_practica: number){
        const existePractica = await this._databaseService.practicas.findUnique({
            where: {
                id_practica: id_practica,
            }
        });

        if(!existePractica){
            return false;
        }
        return true;
    }

}