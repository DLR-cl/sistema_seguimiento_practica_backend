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
    const allowedOrigin = 'https://diis.cl'; // Dominio único permitido

    console.log('Origin received:', origin); // Log para depurar el origen recibido

    if (!origin || origin === allowedOrigin) {
      console.log('Access-Control-Allow-Origin:', origin); // Log del origen permitido
      callback(null, origin); // Permite el dominio específico
    } else {
      console.error('CORS error: Origin not allowed:', origin); // Log de error
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true, // Habilitar cookies y encabezados personalizados
});





  await app.listen(process.env.PORT ||3000);
}
bootstrap();
