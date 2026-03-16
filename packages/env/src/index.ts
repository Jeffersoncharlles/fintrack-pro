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

const parseBoolean = (value: unknown, fallback: boolean) => {
  if (value === undefined || value === null) return fallback
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return fallback

  const normalized = value.trim().toLowerCase()
  if (normalized === 'true' || normalized === '1') return true
  if (normalized === 'false' || normalized === '0') return false
  return fallback
}

const resolveKafkaBrokers = () => {
  return (
    process.env.KAFKA_BROKERS ??
    process.env.CLOUDKARAFKA_BROKERS ??
    process.env.KAFKACLUSTER_BROKERS ??
    'localhost:9093'
  )
}

const resolveKafkaSaslUsername = () => {
  return (
    process.env.KAFKA_SASL_USERNAME ??
    process.env.CLOUDKARAFKA_USERNAME ??
    process.env.KAFKACLUSTER_USERNAME
  )
}

const resolveKafkaSaslPassword = () => {
  return (
    process.env.KAFKA_SASL_PASSWORD ??
    process.env.CLOUDKARAFKA_PASSWORD ??
    process.env.KAFKACLUSTER_PASSWORD
  )
}

const resolveKafkaSaslMechanism = () => {
  if (process.env.KAFKA_SASL_MECHANISM) {
    return process.env.KAFKA_SASL_MECHANISM
  }

  // KafkaCluster exposes credentials for SCRAM-SHA-512 auth.
  if (process.env.KAFKACLUSTER_USERNAME || process.env.KAFKACLUSTER_PASSWORD) {
    return 'scram-sha-512'
  }

  return 'plain'
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
  KAFKA_SSL: z
    .preprocess((value) => parseBoolean(value, false), z.boolean())
    .default(parseBoolean(process.env.KAFKA_SSL, false)),
  KAFKA_SASL_USERNAME: z
    .string()
    .optional()
    .transform((value) => value ?? resolveKafkaSaslUsername()),
  KAFKA_SASL_PASSWORD: z
    .string()
    .optional()
    .transform((value) => value ?? resolveKafkaSaslPassword()),
  KAFKA_SASL_MECHANISM: z
    .enum(['plain', 'scram-sha-256', 'scram-sha-512'])
    .default(
      resolveKafkaSaslMechanism() as
        | 'plain'
        | 'scram-sha-256'
        | 'scram-sha-512',
    ),
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
