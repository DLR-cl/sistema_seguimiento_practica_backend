import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Configuración de CORS
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

  await app.init(); // Inicia la aplicación sin usar `listen`
}

// Exporta el servidor Express como el manejador predeterminado para Vercel
bootstrap();
export default server;
