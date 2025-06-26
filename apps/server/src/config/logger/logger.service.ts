import { Injectable } from '@nestjs/common';
import { WinstonModule, WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

@Injectable()
export class LoggerService {
  createLoggerOptions(): WinstonModuleOptions {
    const logLevel = 'info';
    return {
      transports: [
        new winston.transports.Console({
          level: logLevel,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          level: logLevel,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    };
  }

  createLogger() {
    return WinstonModule.createLogger(this.createLoggerOptions());
  }
}
