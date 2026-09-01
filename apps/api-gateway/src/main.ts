import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { CorsConfig } from './config/cors.config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors(CorsConfig)

  const port = process.env.PORT ?? 3000

  await app.listen(process.env.PORT ?? 3000)

  console.log(`🚀 API Gateway is running on port ${port}`)
}
bootstrap()
