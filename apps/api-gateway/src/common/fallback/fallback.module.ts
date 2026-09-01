import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { DefaultService } from './default.service';

@Module({
  providers: [CacheService, DefaultService]
})
export class FallbackModule {}
