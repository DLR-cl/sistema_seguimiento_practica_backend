import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {


    async onModuleInit() {
        await this.$connect(); // Conectar a la base de datos al iniciar el módulo
        console.log('Prisma conectado a la base de datos');
    }

    async onModuleDestroy() {
        await this.$disconnect(); // Desconectar de la base de datos al destruir el módulo
        console.log('Prisma desconectado de la base de datos');
    }
}
