import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ENSModule } from './ens/ens.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppPropertiesModule } from './app-properties/app-properties.module';
import { AppProperties } from './app-properties/app-properties';
import { LoggerModule } from './logger/logger.module';
import { RequestLogModule } from './request-log/request-log.module';

const ONE_MINUTE_MS = 60_000;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AppPropertiesModule,
    // Per client IP (req.ip, see 'trust proxy' in main.ts)
    ThrottlerModule.forRootAsync({
      inject: [AppProperties],
      useFactory: (props: AppProperties) => ({
        throttlers: [{ ttl: ONE_MINUTE_MS, limit: props.rateLimitPerMinute }],
        skipIf: () => props.rateLimitPerMinute <= 0,
      }),
    }),
    LoggerModule,
    RequestLogModule,
    ScheduleModule.forRoot(),
    ENSModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
