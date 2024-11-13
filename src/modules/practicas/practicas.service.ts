import { BadRequestException, Injectable } from "@nestjs/common";
import { createPracticaDto } from "./dto/create-practicas.dto";
import { DatabaseService } from "src/database/database/database.service";
import { PracticaResponseDto } from "./dto/practica-response.dto";

@Injectable()
export class PracticasService {

    constructor(
        private readonly _databaseService: DatabaseService,
    ){}

    public async generarPractica(practica: createPracticaDto){
        try {
            if(this.existPractica){
                throw new BadRequestException('Ya existe una práctica registrada con esos datos');
            };

            const nuevaPractica = await this._databaseService.practicas.create({
                data: practica,
            });
            const response: PracticaResponseDto = new PracticaResponseDto(nuevaPractica);
            
            return response;

        } catch(error){
            if(error instanceof BadRequestException){
                throw error
            }
        }
    }

    private async existPractica(practica: createPracticaDto){
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
}