import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { ContextLogger, LoggerService } from '../logger/logger.service';
import { RequestStatsService } from './request-stats.service';

@Injectable()
export class RequestLogMiddleware implements NestMiddleware {
  private readonly logger: ContextLogger;

  constructor(
    loggerService: LoggerService,
    private readonly stats: RequestStatsService,
  ) {
    this.logger = loggerService.forContext('HTTP');
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    res.on('finish', () => {
      // req.ip is the client IP thanks to 'trust proxy' (see main.ts)
      const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
      this.stats.record(ip, res.statusCode);
      this.logger.debug(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms ip=${ip}`,
      );
    });
    next();
  }
}
