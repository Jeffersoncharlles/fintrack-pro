import { z } from 'zod'

export const AuthenticateDto = z
  .object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
  })
  .strict()

export type AuthenticateDtoType = z.infer<typeof AuthenticateDto>
