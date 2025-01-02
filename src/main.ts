import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import * as multer from 'multer';
import { allowedNodeEnvironmentFlags } from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Documentacion Sistemas de Seguimiento de Práctica')
    .setDescription('En la documentacion podrá encontrar las funcionalidades de cada función de los servicios')
    .setVersion('1.0')
    .addTag('SSP')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
// arreglar
  app.use((req, res, next) => {
    const allowedOrigin = 'https://www.diis.cl';
    const origin = req.headers.origin;

    if (!origin || origin === allowedOrigin) {
      res.header('Access-Control-Allow-Origin', allowedOrigin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    } else {
      console.warn(`Blocked CORS request from origin: ${origin}`);
    }

    if (req.method === 'OPTIONS') {
      console.log('Preflight request handled for:', origin || 'No Origin');
      return res.status(204).send();
    }

    next();
  });




  await app.listen(process.env.PORT || 3000);
}
// Exporta un manejador compatible con Vercel si es necesario
export const handler = bootstrap();

