import { BadRequestException, HttpCode, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database/database.service";
import { createEmpresasDto } from "./dto/create-empresas.dto";
import { Empresas } from "@prisma/client";

@Injectable()
export class EmpresasService {
    constructor(
        private readonly _databaseService: DatabaseService,
    ){}

    public async crearEmpresas(empresa: createEmpresasDto): Promise<Empresas>{
        
        try{

            if(this.empresasExiste(empresa.nombre_razon_social)){
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

    private async empresasExiste(nombre_empresa: string){
        const existe = await this._databaseService.empresas.findFirst({
            where:{
                nombre_razon_social: nombre_empresa
            }
        });

        if(!existe){
            return false;
        }

        return true;
    }
}