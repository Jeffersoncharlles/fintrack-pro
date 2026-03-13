import { env } from "@fintrack-pro/env";
import { Kafka, Partitioners } from "kafkajs";

const kafka = new Kafka({
	clientId: "fintrack-gateway",
	brokers: [env.KAFKA_BROKERS],
});

export const producer = kafka.producer({
	createPartitioner: Partitioners.LegacyPartitioner,
});

export async function connectKafka() {
	await producer.connect();

	console.log("📡 Kafka Producer: Connected");
}
