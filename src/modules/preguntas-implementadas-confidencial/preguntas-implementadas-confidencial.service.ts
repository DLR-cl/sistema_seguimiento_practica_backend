import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { AsignarPreguntaDto, AsignarPreguntasDto } from '../preguntas-implementadas-informe-alumno/dto/asignar-preguntas.dto';

@Injectable()
export class PreguntasImplementadasConfidencialService {
    
    constructor(
        private readonly _databaseService: DatabaseService,
    ){}

    public async implementarPregunta(pregunta: AsignarPreguntaDto){
        try {
            const implentacion = await this._databaseService.preguntasImplementadasInformeConfidencial.create({
                data: pregunta
            });

            return implentacion;
        } catch (error) {
            throw error;
        }
    }

    public async implementarPreguntas(preguntas: AsignarPreguntasDto){
        try {
            const implementar = await this._databaseService.preguntasImplementadasInformeConfidencial.createMany({
                data: preguntas.preguntas,
            });

            return implementar;

        } catch (error) {
            throw error;
        }
    }

    public async mostrarPreguntas(){
        return await this._databaseService.preguntasImplementadasInformeConfidencial.findMany({
            include:{
                pregunta: true,
            }
        })
    };
}
