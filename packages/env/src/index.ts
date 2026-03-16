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

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback
  return value === 'true' || value === '1'
}

const resolveKafkaBrokers = () => {
  return (
    process.env.KAFKA_BROKERS ??
    process.env.CLOUDKARAFKA_BROKERS ??
    'localhost:9093'
  )
}

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z
    .string()
    .min(32)
    .default('35394886-2291-4298-B75A-93853353B93E'),

  // ──────────────────────────────────────────
  // Kafka
  // ──────────────────────────────────────────
  KAFKA_BROKERS: z.string().default(resolveKafkaBrokers()),
  KAFKA_SSL: z.boolean().default(parseBoolean(process.env.KAFKA_SSL, false)),
  KAFKA_SASL_USERNAME: z
    .string()
    .optional()
    .transform((value) => value ?? process.env.CLOUDKARAFKA_USERNAME),
  KAFKA_SASL_PASSWORD: z
    .string()
    .optional()
    .transform((value) => value ?? process.env.CLOUDKARAFKA_PASSWORD),
  KAFKA_SASL_MECHANISM: z
    .enum(['plain', 'scram-sha-256', 'scram-sha-512'])
    .default('plain'),
  KAFKA_INTERNAL_BROKERS: z.string().default('kafka:29092'),
  ZOOKEEPER_CONNECT: z.string().default('localhost:2181'),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  API_GATEWAY_PORT: z.coerce.number().default(Number(process.env.PORT ?? 3000)),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('❌ variables not valid:', _env.error.format())
  throw new Error('variables not valid.')
}

export const env = _env.data
