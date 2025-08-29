import { Module } from '@nestjs/common';
import { ENSModule } from './ens/ens.module';
import { ResolverModule } from './resolver/resolver.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ ConfigModule.forRoot({
      isGlobal: true,        // makes ConfigService available app-wide
      envFilePath: '.env',   // path to your .env file
    }),ENSModule, ResolverModule],
})
export class AppModule {}
