import { Module } from '@nestjs/common'
import { ProxyService } from './proxy.service.js'

@Module({
  providers: [ProxyService],
})
export class ProxyModule {}
