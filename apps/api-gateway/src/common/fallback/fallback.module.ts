import { Module } from '@nestjs/common'
import { CacheService } from './cache.service.js'
import { DefaultService } from './default.service.js'

@Module({
  providers: [CacheService, DefaultService],
})
export class FallbackModule {}
