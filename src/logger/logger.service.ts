import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerService {
  private readonly debugMode: boolean;

  constructor(config: ConfigService) {
    this.debugMode = config.get<string>('DEBUG_MODE') === 'true';
  }

  forContext(context: string): ContextLogger {
    return new ContextLogger(context, this.debugMode);
  }
}

export class ContextLogger {
  private readonly logger: Logger;

  constructor(
    context: string,
    private readonly debugMode: boolean,
  ) {
    this.logger = new Logger(context);
  }

  log(message: string): void {
    this.logger.log(message);
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  error(message: string, trace?: string): void {
    this.logger.error(message, trace);
  }

  debug(message: string): void {
    if (this.debugMode) {
      this.logger.debug(message);
    }
  }
}
