import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { CircurtBreakerModule } from './common/circurt-breaker/circurt-breaker.module'
import { FallbackModule } from './common/fallback/fallback.module'
import { HealthModule } from './common/health/health.module'
import { AuthModule } from './domain/auth/auth.module'
import { ProxyModule } from './domain/proxy/proxy.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          name: 'short', // Nome do throttler
          ttl: 1000, // 1 segundo
          limit: configService.get<number>('RATE_LIMIT_SHORT', 10), //10 request per minute
        },
        {
          name: 'medium', // Nome do throttler
          ttl: 6000, // 1 minuto
          limit: configService.get<number>('RATE_LIMIT_MEDIUM', 100), //100 request per minute
        },
        {
          name: 'long', // Nome do throttler
          ttl: 900000, // 15 minuto
          limit: configService.get<number>('RATE_LIMIT_LONG', 1000), //1000 request per minute 15 minutes
        },
      ],
      inject: [ConfigService],
    }),
    AuthModule,
    ProxyModule,
    HealthModule,
    CircurtBreakerModule,
    FallbackModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
