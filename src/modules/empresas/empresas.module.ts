import { Module } from "@nestjs/common";
import { EmpresasController } from "./empresas.controller";
import { EmpresasService } from "./empresas.service";
import { DatabaseModule } from "../../database/database/database.module";
import { UsersModule } from "../users/users.module";

@Module({
    imports: [DatabaseModule, UsersModule],
    controllers: [EmpresasController],
    providers: [EmpresasService]
})
export class EmpresasModule {

}