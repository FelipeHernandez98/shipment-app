import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Shipments App API')
    .setDescription('API para gestión de envíos, usuarios y clientes')
    .setVersion('1.0')
    .addTag('users', 'Operaciones relacionadas con usuarios')
    .addTag('clients', 'Operaciones relacionadas con clientes')
    .addTag('shipments', 'Operaciones relacionadas con envíos')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Generar archivo YAML
  const yamlString = yaml.dump(document);
  fs.writeFileSync('./swagger.yaml', yamlString);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
}
bootstrap();
