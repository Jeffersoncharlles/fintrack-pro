import {
  DocumentBuilder,
  type SwaggerCustomOptions,
  type SwaggerDocumentOptions,
} from '@nestjs/swagger'
import { createSchema } from 'zod-openapi'

export const SwaggerConfig = {
  ...new DocumentBuilder()
    .setTitle('Fintrack API Gateway')
    .setDescription(`
      API Gateway para o sistema Fintrack com microservices.

        Serviços Disponíveis:
          - Users Service: Autenticação e gestão de usuários
          - Wallets Service: Gestão de carteiras digitais e transações

          Autenticação:
          - Use JWT Bearer token para rotas protegidas
          - Use Session token para validação de sessão

      `)
    .setVersion('1.0')
    .setContact(
      'Fintrack Team',
      'https://fiintrakpro.com',
      'dev@fiintrakpro.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token to access protected routes',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'session-token',
        in: 'header',
        description: 'Enter session token to validate session',
      },
      'Session-auth',
    )
    .addTag('Authentication', 'Endpoints para autenticação e autorização')
    .addTag('Users', 'Endpoints para gestão de usuários')
    .addTag('Wallets', 'Endpoints para carteiras digitais e transações')
    .addTag('Health', 'Endpoints para monitoramento de saúde')
    .build(),
}

export const documentOptions: SwaggerDocumentOptions = {
  standardSchemaConverter: (schema, { schemaType }) => {
    const converted = createSchema(schema as never, {
      io: schemaType,
      openapiVersion: '3.0.0',
    })

    return {
      schema: converted.schema,
      components: converted.components,
    }
  },
}

export const SwaggerOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true, // Mantém o token de autorização entre as sessões
  },
  customSiteTitle: 'Fintrack API Gateway Documentation', // Título personalizado para a documentação
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title {color: #3b82f6; font-size: 2em; font-weight: bold;}
    .swagger-ui .info .description {color: #6b7280; font-size: 1.2em;}

    `, // Oculta a barra superior da documentação
  // customfavIcon: '/favicon.ico', // Ícone personalizado para a documentação
}
