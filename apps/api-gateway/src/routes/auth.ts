import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const auth: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/',
    {
      schema: {
        summary: 'Authenticate user',
        description: 'Authenticate user and return a token',
        tags: ['Authentication'],
        body: z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }),
        response: {
          200: z.object({
            token: z.string(),
          }),
          401: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {},
  )
}
