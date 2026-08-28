import { connectKafka, consumer, topicName } from './lib/kaafka'
import { processTransfer } from './services/process-transfer'

const KAFKA_RETRY_INTERVAL_MS = 15_000
let isConsumerRunning = false

const startConsumerWithRetry = async () => {
  try {
    if (isConsumerRunning) {
      return
    }

    await connectKafka()
    await consumer.subscribe({
      topic: topicName('transfer.requested'),
      fromBeginning: true,
    })

    isConsumerRunning = true

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const payload = JSON.parse(message.value?.toString() || '{}')

        console.log(`[EVENT] Mensagem recebida no tópico ${topic}`)

        await processTransfer(payload)
      },
    })
  } catch (err) {
    isConsumerRunning = false
    console.error('❌ Erro ao iniciar o Worker. Nova tentativa agendada:', {
      error: err,
      retryInMs: KAFKA_RETRY_INTERVAL_MS,
    })

    setTimeout(() => {
      void startConsumerWithRetry()
    }, KAFKA_RETRY_INTERVAL_MS)
  }
}

void startConsumerWithRetry()
