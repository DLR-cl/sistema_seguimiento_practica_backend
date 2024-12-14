import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';

@Injectable()
export class AlumnosNominaService {

    constructor(
        private readonly _databaseService: DatabaseService
    )    {}
    async guardarUsuarios(datos: { rut: string; nombre: string; email: string }[]): Promise<void> {
        await this._databaseService.alumnasNomina.createMany({
          data: datos,
        });
      }
}
