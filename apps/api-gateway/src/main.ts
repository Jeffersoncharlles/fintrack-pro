import { StandardSchemaValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module.js'
import { CorsConfig } from './config/cors.config.js'
import { HelmetConfig } from './config/helmet.config.js'
import {
  documentOptions,
  SwaggerConfig,
  SwaggerOptions,
} from './config/swagger.config.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(helmet(HelmetConfig))
  app.enableCors(CorsConfig)

  app.useGlobalPipes(new StandardSchemaValidationPipe())

  const document = SwaggerModule.createDocument(
    app,
    SwaggerConfig,
    documentOptions,
  )
  SwaggerModule.setup('docs', app, document, {
    ...SwaggerOptions,
  })

  const port = process.env.PORT ?? 3000

  await app.listen(port)

  console.log(`🚀 API Gateway is running on port ${port}`)
  console.log(
    `📚 Swagger documentation is available at: http://localhost:${port}/docs`,
  )
}
bootstrap()
