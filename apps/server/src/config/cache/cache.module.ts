import { Module } from '@nestjs/common';
import { AppConfigModule } from '../app/config.module';
import { CacheClientService } from './cache-client.service';
import { CacheService } from './cache.service';

@Module({
  imports: [AppConfigModule],
  providers: [CacheClientService, CacheService],
  exports: [CacheClientService, CacheService],
})
export class CacheModule {}
