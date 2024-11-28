import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
  app.enableCors()
  await app.listen(3000);
}
bootstrap();
