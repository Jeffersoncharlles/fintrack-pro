import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { auth } from './auth'
import { createUser } from './create-user'

export const routes: FastifyPluginAsyncZod = async (app) => {
  app.register(auth, { prefix: '/auth/authenticate' })
  app.register(createUser, { prefix: '/auth/create' })
}
