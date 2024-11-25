import { BadRequestException, Injectable, InternalServerErrorException, NotAcceptableException } from "@nestjs/common";
import { createPracticaDto } from "./dto/create-practicas.dto";
import { DatabaseService } from "../../database/database/database.service";
import { PracticaResponseDto } from "./dto/practica-response.dto";
import { AlumnoPracticaService } from "../alumno_practica/alumno_practica.service";
import { Estado_practica, TipoPractica } from "@prisma/client";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MailService } from "src/mail/mail.service";
import { SendEmailDto } from "src/mail/dto/mail.dto";

@Injectable()
export class PracticasService {

    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _alumnoService: AlumnoPracticaService,
        private readonly _emailService: MailService,
    ){}

    public async generarPractica(practica: createPracticaDto){
        try {
            
            // si ya existe una práctica definida
            if(await this.hayPractica(practica)){
                throw new BadRequestException('Ya existe una práctica registrada con esos datos');
            };

            const activar = await this.activarPractica(practica.id_alumno, practica.tipo_practica);
            // si el alumno no está activo en ninguna práctica
            if(!await this._alumnoService.alumnoActivo(practica.id_alumno)){
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
            }else{
                throw new InternalServerErrorException('Error interno');
            }
        }
    }

    public async hayPractica(practica: createPracticaDto){
        const existePractica = await this._databaseService.practicas.findFirst({
            where:{
                id_alumno: practica.id_alumno,
                id_supervisor: practica.id_supervisor,
                tipo_practica: practica.tipo_practica,
                fecha_inicio: practica.fecha_inicio,
                estado: Estado_practica.CURSANDO
            }
        });

        if(!existePractica){
            return false;
        }
        return true;
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

    public async activarPractica(id_alumno: number, tipo_practica: TipoPractica){
        if(tipo_practica == TipoPractica.PRACTICA_UNO){
            const alumno = await this._databaseService.alumnosPractica.update({
                where: {
                    id_user: id_alumno,
                },
                data: {
                    primer_practica: true,
                }
            });
        }else {
            const alumno = await this._databaseService.alumnosPractica.update({
                where: {
                    id_user: id_alumno,
                },
                data: {
                    segunda_practica: true,
                }
            });
        }        
    }

    public async cambiarEstadoPractica(id_practica: number, estado_nuevo: Estado_practica){
        const practica = await this._databaseService.practicas.update({
            where: {
                id_practica: id_practica,
            },
            data: {
                estado: estado_nuevo
            }
        });
    }

    public async getPracticasActivas(){
        try {
            const practicas = await this._databaseService.practicas.findMany({
                where: {
                    fecha_termino: null,
                }
            });

            return practicas;

        } catch (error) {
            
        }
    }

    public async getAllPracticas(){
        try {
            const practicas = await this._databaseService.practicas.findMany();
            return practicas
        }catch(error){
        }
    }

    public async getPractica(id_practica: number){
        try {
            if(!this.existePractica(id_practica)){
                throw new BadRequestException('No existe practica solicitada')
            }

            const practica = await this._databaseService.practicas.findUnique({
                where: {
                    id_practica: id_practica
                }
            });

            return practica;
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
        }
    }

    @Cron('0 30 11 * * 1-5', {
        name: 'practica_dias',
        timeZone: 'America/Santiago'
    })
    private async checkEstadoPractica(){
        try {

            const practicas = await this._databaseService.practicas.findMany({
                where: {
                    estado: Estado_practica.CURSANDO,
                },
                include: {
                    alumno: {
                        include: {
                            usuario: true,
                        }
                    }
                }
            });
            const fecha_actual = new Date();
            practicas.forEach((practica) => {
                const fechaTermino = new Date(practica.fecha_termino);
                const diferenciaDias = Math.ceil(
                    (fechaTermino.getTime() - fecha_actual.getTime()) / (1000 * 60 * 60 * 24),
                );

                if(diferenciaDias == 3){
                    const message: SendEmailDto = {
                        recipients: [practica.alumno.usuario.correo],
                        subject: 'Alerta de duración de práctica',
                        html: 'Estimado/a actualmente le queda 3 días de práctica, en caso de extender su práctica por favor solicite dicha extension a la brevedad, en caso que no ignore este correo, gracias',
                    }
                    this._emailService.sendEmail(message);
                }
            });
        } catch (error) {
            throw error;
        }
    }

}