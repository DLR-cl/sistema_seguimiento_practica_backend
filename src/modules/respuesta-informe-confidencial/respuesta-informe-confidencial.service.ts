import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { CreateRespuestaInformConfidencialDto } from './dto/respuesta.dto';

@Injectable()
export class RespuestaInformeConfidencialService {

    constructor(
        private readonly _databaseService: DatabaseService
    ){}


    async crearRespuestas(respuestas: CreateRespuestaInformConfidencialDto[]){
        try {

            const informeExiste = await this._databaseService.informeConfidencial.findUnique({
                where: {
                    id_informe_confidencial: respuestas[0].id_informe,
                }
            });

            if(!informeExiste){
                throw new BadRequestException('No informe confidencial para las respuestas');
            }
            respuestas.map( async (r) => {
                if(r.respuesta_texto){
                    await this._databaseService.respuestasInformeConfidencial.create({
                        data: {
                            respuesta_texto: r.respuesta_texto,
                            informe_id: r.id_informe,
                            pregunta_id: r.id_pregunta
                        }
                    })
                }else{
                    await this._databaseService.respuestasInformeConfidencial.create({
                        data: {
                            puntos: r.puntos,
                            informe_id: r.id_informe,
                            pregunta_id: r.id_pregunta
                        }
                    })
                }
            });

        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
            throw new InternalServerErrorException('Error interno al crear una practica');
        }
    }
}
