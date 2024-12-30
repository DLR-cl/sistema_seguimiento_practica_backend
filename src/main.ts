import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import * as multer from 'multer';
import * as cookieParser from 'cookie-parser';
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
  app.enableCors({
    origin: [
    'https://sistema-practicas.diis.cl',
    'https://www.sistema-practicas.diis.cl',
  ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  

  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      const allowedOrigins = [
          'https://sistema-practicas.diis.cl',
          'https://www.sistema-practicas.diis.cl',
      ];
      const origin = req.headers.origin;
  
      if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
      }
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.status(204).send();
    } else {
      next();
    }
  });
  
  

  await app.listen(process.env.PORT ||3000);
}
bootstrap();
