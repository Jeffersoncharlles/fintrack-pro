import { env } from "@fintrack-pro/env";
import { Kafka } from "kafkajs";

const kafka = new Kafka({
	clientId: "fintrack-transaction-service",
	brokers: [env.KAFKA_BROKERS],
});

export const consumer = kafka.consumer({ groupId: "transaction-group" });

export async function connectKafka() {
	await consumer.connect();
	console.log("📥 Kafka Consumer: Connected");
}
