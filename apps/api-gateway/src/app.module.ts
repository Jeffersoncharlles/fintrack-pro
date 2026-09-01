import { Module } from '@nestjs/common'
import { AuthModule } from './domain/auth/auth.module'
import { HealthModule } from './domain/health/health.module'
import { ProxyModule } from './domain/proxy/proxy.module'

@Module({
  imports: [AuthModule, ProxyModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
