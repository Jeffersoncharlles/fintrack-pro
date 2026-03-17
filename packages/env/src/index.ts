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

const normalizeKafkaBroker = (value: string) =>
  value
    .trim()
    .replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '')
    .replace(/^\/+/, '')

const normalizeKafkaBrokers = (value: string) =>
  value
    .split(',')
    .map((broker) => normalizeKafkaBroker(broker))
    .filter(Boolean)
    .join(',')

const resolveKafkaBrokers = () => {
  const raw =
    process.env.KAFKA_BROKERS ??
    process.env.CLOUDKARAFKA_BROKERS ??
    process.env.KAFKACLUSTER_BROKERS ??
    process.env.AIVEN_KAFKA_BROKERS ??
    'localhost:9093'

  return normalizeKafkaBrokers(raw)
}

const resolveKafkaSaslUsername = () => {
  return (
    process.env.KAFKA_SASL_USERNAME ??
    process.env.CLOUDKARAFKA_USERNAME ??
    process.env.KAFKACLUSTER_USERNAME ??
    process.env.AIVEN_KAFKA_USERNAME
  )
}

const resolveKafkaSaslPassword = () => {
  return (
    process.env.KAFKA_SASL_PASSWORD ??
    process.env.CLOUDKARAFKA_PASSWORD ??
    process.env.KAFKACLUSTER_PASSWORD ??
    process.env.AIVEN_KAFKA_PASSWORD
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

const resolveKafkaSslDefault = () => {
  const explicit = process.env.KAFKA_SSL
  if (explicit !== undefined) {
    return parseBoolean(explicit, false)
  }

  const brokers = resolveKafkaBrokers()
  const brokerLooksSecure = brokers
    .split(',')
    .some((broker) => broker.endsWith(':9094'))

  const hasManagedKafkaCredentials =
    Boolean(process.env.CLOUDKARAFKA_USERNAME) ||
    Boolean(process.env.CLOUDKARAFKA_PASSWORD) ||
    Boolean(process.env.KAFKACLUSTER_USERNAME) ||
    Boolean(process.env.KAFKACLUSTER_PASSWORD)

  return brokerLooksSecure || hasManagedKafkaCredentials
}

const resolveKafkaRejectUnauthorizedDefault = () => {
  if (process.env.KAFKA_SSL_REJECT_UNAUTHORIZED !== undefined) {
    return parseBoolean(process.env.KAFKA_SSL_REJECT_UNAUTHORIZED, true)
  }

  // Managed Kafka providers may use non-public CA chains.
  // If no custom CA is provided, default to a permissive mode.
  if (!process.env.KAFKA_SSL_CA) {
    return false
  }

  return true
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
  KAFKA_BROKERS: z
    .preprocess(
      (value) =>
        value === undefined || value === null
          ? resolveKafkaBrokers()
          : normalizeKafkaBrokers(String(value)),
      z.string(),
    )
    .default(resolveKafkaBrokers()),
  KAFKA_SSL: z
    .preprocess((value) => parseBoolean(value, false), z.boolean())
    .default(resolveKafkaSslDefault()),
  KAFKA_SSL_REJECT_UNAUTHORIZED: z
    .preprocess(
      (value) => parseBoolean(value, resolveKafkaRejectUnauthorizedDefault()),
      z.boolean(),
    )
    .default(resolveKafkaRejectUnauthorizedDefault()),
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
  KAFKA_TOPIC_PREFIX: z.string().default(process.env.KAFKA_TOPIC_PREFIX ?? ''),
  KAFKA_SSL_CERT: z.string().optional(),
  KAFKA_SSL_KEY: z.string().optional(),
  KAFKA_SSL_CA: z.string().optional(),
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
