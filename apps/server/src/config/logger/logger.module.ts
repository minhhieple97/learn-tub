import { Module } from '@nestjs/common';
import { AppConfigModule } from '../app/config.module';
import { LoggerService } from './logger.service';

@Module({
  imports: [],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {} 