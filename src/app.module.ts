import { Module } from '@nestjs/common';
import { ENSModule } from './ens/ens.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppPropertiesModule } from './app-properties/app-properties.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AppPropertiesModule,
    ScheduleModule.forRoot(),
    ENSModule,
  ],
})
export class AppModule {}
