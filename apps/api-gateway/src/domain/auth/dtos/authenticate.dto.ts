import { z } from 'zod'

export const AuthenticateDto = z
  .object({
    email: z.email('Invalid email format'),
    password: z.string().min(6, 'Password is required'),
  })
  .strict()

export type AuthenticateDtoType = z.infer<typeof AuthenticateDto>

export const UserSessionSchema = z.object({
  valid: z.boolean(),
  user: z
    .object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      role: z.string(),
      statues: z.string(),
      email: z.email('Invalid email format'),
    })
    .nullable(),
})

export type UserSession = z.infer<typeof UserSessionSchema>

export const AuthResponseSchema = z.object({
  access_token: z.string(),
  user: UserSessionSchema.shape.user,
})

export type AuthResponse = z.infer<typeof AuthResponseSchema>

export const CreateUserBodySchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
})

export type CreateUserBody = z.infer<typeof CreateUserBodySchema>
