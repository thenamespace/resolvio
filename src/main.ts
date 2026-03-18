import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './docs/swagger.config';
import { AppProperties } from './app-properties/app-properties';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const appProperties = app.get(AppProperties);

  if (appProperties.enableDocs) {
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  app.enableCors({
    methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: '*',
    origin: '*',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
