import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../database/database/database.service';
import { CreateRespuestaInformConfidencialDto } from './dto/respuesta.dto';
import { TipoEmpresa } from '@prisma/client';

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
            console.log(respuestas)
            respuestas.map( async (r) => {
                console.log(r)
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
            const supervisor = await this._databaseService.jefesAlumno.findUnique({
                where: { id_user: +informeExiste.id_supervisor },

            });
            if(!supervisor){
                throw new BadRequestException('Error, no existe supervisor');
            }
            console.log(supervisor)
            await this._databaseService.empresas.update({
                where: {id_empresa: supervisor.id_empresa},
                data: {
                    rubro: respuestas[0].respuesta_texto,
                    caracter_empresa: respuestas[1].respuesta_texto.toUpperCase() as TipoEmpresa,
                    tamano_empresa: respuestas[2].respuesta_texto,
                }
            })

            return {
                message: 'Respuestas registradas con éxito',
                statusCode: HttpStatus.OK,
            }
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
            console.log(error);
            throw new InternalServerErrorException('Error interno al crear respuesta');
        }
    }
}
