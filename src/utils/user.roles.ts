import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { Tipo_usuario } from "@prisma/client"

export const isRole = (role: Tipo_usuario): boolean => {
    try {
        console.log(role)
        if(role in Tipo_usuario){
            return true;
        }else{
            return false;
        }
    }catch(error){

        throw new InternalServerErrorException('Error interno al comparar el rol')
    }
}