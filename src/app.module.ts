import { Module } from '@nestjs/common';
import { ENSModule } from './ens/ens.module';
import { ResolverModule } from './resolver/resolver.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [ 
    ConfigModule.forRoot({
      isGlobal: true,        // makes ConfigService available app-wide
      envFilePath: '.env',   // path to your .env file
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*'], // Exclude API routes from static file serving
    }),
    ENSModule, 
    ResolverModule
  ],
})
export class AppModule {}
