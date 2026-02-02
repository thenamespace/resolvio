import { Request, Response } from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './docs/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // enables class-transformer on @Query DTOs
      whitelist: true, // strip unknown params
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger configuration
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Swagger UI endpoint
  SwaggerModule.setup('api/docs', app, document);

  // Make the OpenAPI document available globally for the API docs controller
  app.use('/api/docs-json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(document);
  });

  // Also provide the document at the standard OpenAPI endpoint
  app.use('/api/openapi.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(document);
  });

  app.enableCors({
    methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: '*',
    origin: '*',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
