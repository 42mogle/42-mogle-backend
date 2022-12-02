import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /* When using ssl for https

  const httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/archive/42mogle.com/privkey1.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/archive/42mogle.com/fullchain1.pem'),
  };
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  */

  // Setting Swagger
  const config = new DocumentBuilder()
    .setTitle('42mogle API docs')
    .setDescription('API description')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Resolving CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
