import { db, eq, users } from '@fintrack-pro/db'
import bcrypt from 'bcrypt'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const createUser: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/',
    {
      schema: {
        summary: 'Create user',
        description: 'Create a new user account',
        tags: ['Users'],
        body: z.object({
          name: z.string(),
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
          500: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password, name } = request.body

      const userExists = await db
        .select()
        .from(users)
        .where(eq(users.email, email))

      if (userExists) {
        return reply.status(401).send({ message: 'User already exists' })
      }

      const passwordHash = await bcrypt.hash(password, 10)

      const newUser = await db
        .insert(users)
        .values({
          name,
          email,
          passwordHash,
        })
        .returning({ id: users.id })

      if (!newUser) {
        return reply.status(500).send({ message: 'Failed to create user' })
      }
    },
  )
}
