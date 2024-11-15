import { Module } from "@nestjs/common";
import { PracticasController } from "./practicas.controller";
import { PracticasService } from "./practicas.service";
import { DatabaseService } from "src/database/database/database.service";
import { AlumnoPracticaService } from "../alumno_practica/alumno_practica.service";
import { AuthService } from "src/auth/auth.service";
import { UsersService } from "../users/users.service";
import { DatabaseModule } from "src/database/database/database.module";
import { AlumnoPracticaModule } from "../alumno_practica/alumno_practica.module";
import { AuthModule } from "src/auth/auth.module";
import { UsersModule } from "../users/users.module";

@Module({
    controllers: [PracticasController],
    providers: [PracticasService],
    exports: [PracticasService],
    imports: [DatabaseModule, AlumnoPracticaModule, AuthModule, UsersModule]
})
export class PracticasModule {}