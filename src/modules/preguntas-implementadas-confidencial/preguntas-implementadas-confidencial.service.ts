import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database/database.service';
import { AsignarPreguntaDto} from '../preguntas-implementadas-informe-alumno/dto/asignar-preguntas.dto';

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

    public async implementarPreguntas(preguntas: AsignarPreguntaDto[]){
        try {
            const implementar = await this._databaseService.preguntasImplementadasInformeConfidencial.createMany({
                data: preguntas,
            });

            return implementar;

        } catch (error) {
            throw error;
        }
    }

    public async mostrarPreguntas(){
        const preguntas = await this._databaseService.preguntasImplementadasInformeConfidencial.findMany({
            include:{
                pregunta: {
                    include: {
                        dimension: true,
                    }
                },
            }
        })
        console.log(preguntas[0].pregunta.dimension);
        return preguntas;
    };

    // public async actualizarPreguntas(preguntas: AsignarPreguntaDto){
    //     try {
    //         const preguntasCambiadas = await this._databaseService.preguntasImplementadasInformeAlumno.updateMany({
    //             data: preguntas,
    //         });

    //         return preguntasCambiadas;
    //     } catch (error) {
    //         throw error;
    //     }
    // }
}
