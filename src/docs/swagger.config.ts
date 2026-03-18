import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Resolvio API')
  .setDescription(
    'ENS Resolution Service - Resolve ENS names, addresses, profiles and bulk reverse resolve',
  )
  .setVersion('1.0')
  .setContact(
    'Development Team',
    'https://namespace.ninja',
    'arti@namespace.ninja',
  )
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .addTag('Forward Resolution', 'Resolve ENS names to addresses, text records, and content hashes')
  .addTag('Reverse Resolution', 'Resolve Ethereum addresses to ENS names')
  .build();
