import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,            // enables class-transformer on @Query DTOs
    whitelist: true,            // strip unknown params
  }))

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
