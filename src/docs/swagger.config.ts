import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Universal Resolution Service API')
  .setDescription('A unified API for resolving names across multiple naming systems and protocols. This service provides a single interface for ENS resolution with plans to extend support to other naming systems.')
  .setVersion('1.0.0')
  .setContact('Development Team', 'https://namespace.ninja', 'arti@namespace.ninja')
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .addTag('ENS', 'Ethereum Name Service resolution endpoints')
  .addTag('Resolution', 'General resolution endpoints')
  .build(); 