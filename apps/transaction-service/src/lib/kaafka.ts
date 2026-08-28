import { env } from '@fintrack-pro/env'
import { Kafka } from 'kafkajs'

export const topicName = (name: string) => `${env.KAFKA_TOPIC_PREFIX}${name}`

const resolveKafkaBrokers = () =>
  env.KAFKA_BROKERS.split(',')
    .map((broker) => broker.trim())
    .filter(Boolean)

const getKafkaSasl = () => {
  const username = env.KAFKA_SASL_USERNAME
  const password = env.KAFKA_SASL_PASSWORD

  if (!username || !password) {
    return undefined
  }

  switch (env.KAFKA_SASL_MECHANISM) {
    case 'plain':
      return { mechanism: 'plain' as const, username, password }
    case 'scram-sha-256':
      return { mechanism: 'scram-sha-256' as const, username, password }
    case 'scram-sha-512':
      return { mechanism: 'scram-sha-512' as const, username, password }
  }
}

const getKafkaSsl = () => {
  if (!env.KAFKA_SSL) return false

  const normalizePem = (value?: string) =>
    value ? value.replace(/\\n/g, '\n') : undefined
  const sslCa = normalizePem(env.KAFKA_SSL_CA)
  const sslCert = normalizePem(env.KAFKA_SSL_CERT)
  const sslKey = normalizePem(env.KAFKA_SSL_KEY)
  const hasClientCertificate = Boolean(sslCert && sslKey)

  return {
    cert: hasClientCertificate ? sslCert : undefined,
    key: hasClientCertificate ? sslKey : undefined,
    ca: sslCa ? [sslCa] : undefined,
    rejectUnauthorized: env.KAFKA_SSL_REJECT_UNAUTHORIZED,
  }
}

const kafka = new Kafka({
  clientId: 'fintrack-transaction-service',
  brokers: resolveKafkaBrokers(),
  ssl: getKafkaSsl(),
  sasl: getKafkaSasl(),
})

export const consumer = kafka.consumer({ groupId: 'transaction-group' })

export async function connectKafka() {
  try {
    await consumer.connect()
    console.log('📥 Kafka Consumer: Connected')
  } catch (error) {
    console.error('❌ Kafka Consumer: Connection Error', {
      brokers: resolveKafkaBrokers(),
      error,
    })
    throw error
  }
}
