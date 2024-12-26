import { Module } from "@nestjs/common";
import { PracticasController } from "./practicas.controller";
import { PracticasService } from "./practicas.service";
import { DatabaseModule } from "../../database/database/database.module";
import { AlumnoPracticaModule } from "../alumno_practica/alumno_practica.module";
import { AuthModule } from "../../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { MailModule } from "../../mail/mail.module";
import { ReportesExcelService } from './services/reportes-excel/reportes-excel.service';
import { AutoFuncService } from "./services/auto-func/auto-func.service";

@Module({
    controllers: [PracticasController],
    providers: [PracticasService, ReportesExcelService, AutoFuncService],
    exports: [PracticasService],
    imports: [DatabaseModule, AlumnoPracticaModule, AuthModule, UsersModule, MailModule]
})
export class PracticasModule {}