import { env } from '@fintrack-pro/env'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/schemas/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
