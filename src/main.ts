import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {

  const httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/archive/42mogle.com/privkey1.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/archive/42mogle.com/fullchain1.pem'),
    //key: fs.readFileSync('./secrets/private-key.pem'),
    //cert: fs.readFileSync('./secrets/public-certificate.pem'),
  };
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  // Setting Swagger
  const config = new DocumentBuilder()
    .setTitle('42Mogle using swagger')
    .setDescription('API description')
    .setVersion('0.0.1')
    .addTag('swagger')
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
