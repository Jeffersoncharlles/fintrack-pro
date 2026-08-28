import { Module } from '@nestjs/common'

import { AuthModule } from './domain/auth/auth.module'

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
