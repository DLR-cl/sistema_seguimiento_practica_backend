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

    console.log('Origin received:', origin); // Log del origen recibido

    if (!origin) {
      console.warn('No Origin header received. Allowing by default.'); // Advertencia para solicitudes internas
      callback(null, allowedOrigin); // Configura el origen permitido para solicitudes internas
    } else if (origin === allowedOrigin) {
      console.log('Access-Control-Allow-Origin:', origin); // Confirmación del origen permitido
      callback(null, origin); // Permite el origen específico
    } else {
      console.error('CORS error: Origin not allowed:', origin); // Log de error
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true, // Permitir cookies y encabezados personalizados
});
app.use((req, res, next) => {
  const allowedOrigin = 'https://www.diis.cl'; // Dominio único permitido
  const origin = req.headers.origin;

  if (origin === allowedOrigin) {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).send(); // Respuesta rápida para solicitudes preflight
  }

  next();
});

  








  await app.listen(process.env.PORT ||3000);
}
bootstrap();
