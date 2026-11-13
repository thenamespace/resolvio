import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './docs/swagger.config';
import { AppProperties } from './app-properties/app-properties';

async function bootstrap() {
  // Gate debug/verbose logging behind DEBUG_MODE. Several components log via a
  // raw Nest Logger (e.g. the resolver caches' per-lookup "Cache hit" lines),
  // which bypasses the DEBUG_MODE check in LoggerService; setting the Nest log
  // levels here silences that firehose in prod, where DEBUG_MODE is unset.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger:
      process.env.DEBUG_MODE === 'true'
        ? ['error', 'warn', 'log', 'debug', 'verbose']
        : ['error', 'warn', 'log'],
  });

  // Expect a single reverse proxy in front of the app; trust one hop so req.ip is the client IP.
  app.set('trust proxy', 1);

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
    SwaggerModule.setup('api-docs', app, document);
    app
      .getHttpAdapter()
      .get('/api-docs.json', (_req: Request, res: Response) =>
        res.json(document),
      );
  }

  app.enableCors({
    methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: '*',
    origin: '*',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
