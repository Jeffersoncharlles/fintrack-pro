import { env } from "@fintrack-pro/env";
import { Kafka, Partitioners } from "kafkajs";

const kafka = new Kafka({
	clientId: "fintrack-api-gateway",
	brokers: [env.KAFKA_BROKERS],
});

export const producer = kafka.producer({
	createPartitioner: Partitioners.LegacyPartitioner,
});

export async function connectKafka() {
	try {
		await producer.connect();
		console.log("📡 Kafka Producer (Gateway): Connected");
	} catch (error) {
		console.error("❌ Kafka Connection Error:", error);
	}
}
