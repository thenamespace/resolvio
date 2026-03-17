import { Module } from '@nestjs/common';
import { ENSModule } from './ens/ens.module';
import { ResolverModule } from './resolver/resolver.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { AppPropertiesModule } from './app-properties/app-properties.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AppPropertiesModule,
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api', '/ens'], // Exclude API routes from static file serving
    }),
    ENSModule,
    ResolverModule,
  ],
})
export class AppModule {}
