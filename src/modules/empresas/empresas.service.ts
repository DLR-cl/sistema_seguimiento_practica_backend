import { BadRequestException, HttpCode, HttpException, HttpStatus, Injectable, UseGuards } from "@nestjs/common";
import { DatabaseService } from "../../database/database/database.service";
import { createEmpresasDto } from "./dto/create-empresas.dto";
import { Empresas } from "@prisma/client";
import { EmpresasDataDto } from "./dto/empresas-data.dto";
import { AuthGuard } from "src/auth/guards/auth.guard";

@Injectable()
export class EmpresasService {
    constructor(
        private readonly _databaseService: DatabaseService,
    ){}

    public async crearEmpresas(empresa: createEmpresasDto): Promise<Empresas>{
        
        try{
            let existe = await this.empresasExiste(empresa.nombre_razon_social);
            if(existe){
                throw new BadRequestException('Empresa ya existente');
            }

            const nuevaEmpresa = await this._databaseService.empresas.create({
                data: empresa,
            });
            
            return nuevaEmpresa;

        } catch(error){
            if(error instanceof BadRequestException){
                throw error;
            }else{
                throw new HttpException('Error servidor', HttpStatus.BAD_GATEWAY);
            }
        }

    };

    public async getEmpresas(){
        const empresas: EmpresasDataDto[] = await this._databaseService.empresas.findMany({
            include:{
                jefe_supervisor: {
                    include: {
                        usuario: true,
                    }
                },
            }
        });

        return empresas
    }
    private async empresasExiste(nombre_empresa: string){
        const existe = await this._databaseService.empresas.findFirst({
            where:{
                nombre_razon_social: nombre_empresa
            }
        });
        console.log(!existe, "hola");
        if(!existe){
            return false;
        }

        return true;
    }

    
}