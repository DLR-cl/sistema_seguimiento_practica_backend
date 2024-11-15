import { Module } from "@nestjs/common";
import { EmpresasController } from "./empresas.controller";
import { EmpresasService } from "./empresas.service";
import { DatabaseService } from "src/database/database/database.service";
import { DatabaseModule } from "src/database/database/database.module";

@Module({
    imports: [DatabaseModule],
    controllers: [EmpresasController],
    providers: [EmpresasService]
})
export class EmpresasModule {

}