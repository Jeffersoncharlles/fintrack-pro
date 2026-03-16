import { env } from "@fintrack-pro/env";
import { Kafka, Partitioners } from "kafkajs";

const getKafkaSasl = () => {
	const username = env.KAFKA_SASL_USERNAME;
	const password = env.KAFKA_SASL_PASSWORD;

	if (!username || !password) {
		return undefined;
	}

	switch (env.KAFKA_SASL_MECHANISM) {
		case "plain":
			return { mechanism: "plain" as const, username, password };
		case "scram-sha-256":
			return { mechanism: "scram-sha-256" as const, username, password };
		case "scram-sha-512":
			return { mechanism: "scram-sha-512" as const, username, password };
	}
};

const kafka = new Kafka({
	clientId: "fintrack-api-gateway",
	brokers: [env.KAFKA_BROKERS],
	ssl: env.KAFKA_SSL,
	sasl: getKafkaSasl(),
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
