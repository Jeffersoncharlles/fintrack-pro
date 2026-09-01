import { Module } from '@nestjs/common';
import { CircurtBreakerService } from './circurt-breaker.service';

@Module({
  providers: [CircurtBreakerService]
})
export class CircurtBreakerModule {}
