import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { config } from 'dotenv'
import { z } from 'zod'

function loadEnvFile() {
  let currentDir = process.cwd()
  while (true) {
    const envPath = join(currentDir, '.env')
    if (existsSync(envPath)) {
      config({ path: envPath })
      return
    }
    const parentDir = dirname(currentDir)
    if (parentDir === currentDir) {
      return
    }
    currentDir = parentDir
  }
}

loadEnvFile()

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z
    .string()
    .min(32)
    .default('35394886-2291-4298-B75A-93853353B93E'),

  // ──────────────────────────────────────────
  // Kafka
  // ──────────────────────────────────────────
  KAFKA_BROKERS: z.string().default('localhost:9093'),
  KAFKA_INTERNAL_BROKERS: z.string().default('kafka:29092'),
  ZOOKEEPER_CONNECT: z.string().default('localhost:2181'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  API_GATEWAY_PORT: z.coerce.number().default(3000),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('❌ variables not valid:', _env.error.format())
  throw new Error('variables not valid.')
}

export const env = _env.data
