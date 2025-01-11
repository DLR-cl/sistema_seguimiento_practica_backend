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

app.enableCors({
  origin: (origin, callback) => {
    const allowedOrigin = 'https://www.diis.cl'; // Dominio único permitido
    //const allowedOrigin = 'http://localhost:4200'; // Dominio único permitido


    if (!origin) {
      console.warn('No Origin header received. Defaulting to allowedOrigin.');
      callback(null, allowedOrigin); // Permitir solicitudes internas sin encabezado Origin
    } else if (origin === allowedOrigin) {
      callback(null, origin); // Configura el encabezado correctamente
    } else {
      console.error('CORS error: Origin not allowed:', origin); // Log del error
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});


  await app.listen(process.env.PORT ||3000);
}
bootstrap();
