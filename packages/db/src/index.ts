import { env } from '@fintrack-pro/env'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schemas'

export * from 'drizzle-orm'

const client = postgres(env.DATABASE_URL)
export const db = drizzle(client, { schema })

export * from './schemas'
