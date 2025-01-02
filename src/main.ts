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
    const allowedOrigins = [
      'https://www.diis.cl',
      'https://sistema-practicas.diis.cl',
    ];

    console.log('Origin received:', origin); // Depuración

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin); // Permite el origen de la solicitud
    } else {
      console.error('CORS error: Origin not allowed:', origin); // Log para depuración
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true, // Habilitar el uso de cookies o encabezados personalizados
});




  await app.listen(process.env.PORT ||3000);
}
bootstrap();
