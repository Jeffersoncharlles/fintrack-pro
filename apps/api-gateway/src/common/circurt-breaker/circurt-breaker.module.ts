import { Module } from '@nestjs/common'
import { CircurtBreakerService } from './circurt-breaker.service.js'

@Module({
  providers: [CircurtBreakerService],
})
export class CircurtBreakerModule {}
