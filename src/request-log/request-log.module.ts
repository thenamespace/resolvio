import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RequestLogMiddleware } from './request-log.middleware';
import { RequestStatsService } from './request-stats.service';

@Module({
  providers: [RequestStatsService],
})
export class RequestLogModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLogMiddleware).forRoutes('*');
  }
}
