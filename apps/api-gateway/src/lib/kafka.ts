import { env } from "@fintrack-pro/env";
import { Kafka, Partitioners } from "kafkajs";

export const topicName = (name: string) => `${env.KAFKA_TOPIC_PREFIX}${name}`;

const resolveKafkaBrokers = () =>
	env.KAFKA_BROKERS.split(",")
		.map((broker) => broker.trim())
		.filter(Boolean);

let isProducerConnected = false;

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

const getKafkaSsl = () => {
	if (!env.KAFKA_SSL) return false;

	const normalizePem = (value?: string) =>
		value ? value.replace(/\\n/g, "\n") : undefined;
	const sslCa = normalizePem(env.KAFKA_SSL_CA);
	const sslCert = normalizePem(env.KAFKA_SSL_CERT);
	const sslKey = normalizePem(env.KAFKA_SSL_KEY);
	const hasClientCertificate = Boolean(sslCert && sslKey);

	return {
		cert: hasClientCertificate ? sslCert : undefined,
		key: hasClientCertificate ? sslKey : undefined,
		ca: sslCa ? [sslCa] : undefined,
		rejectUnauthorized: env.KAFKA_SSL_REJECT_UNAUTHORIZED,
	};
};

const kafka = new Kafka({
	clientId: "fintrack-api-gateway",
	brokers: resolveKafkaBrokers(),
	ssl: getKafkaSsl(),
	sasl: getKafkaSasl(),
});

export const producer = kafka.producer({
	createPartitioner: Partitioners.LegacyPartitioner,
});

producer.on(producer.events.CONNECT, () => {
	isProducerConnected = true;
});

producer.on(producer.events.DISCONNECT, () => {
	isProducerConnected = false;
});

export async function connectKafka() {
	try {
		await producer.connect();
		isProducerConnected = true;
		console.log("📡 Kafka Producer (Gateway): Connected");
	} catch (error) {
		isProducerConnected = false;
		console.error("❌ Kafka Producer (Gateway): Connection Error", {
			brokers: resolveKafkaBrokers(),
			error,
		});
		throw error;
	}
}

export function getKafkaProducerHealth() {
	return {
		connected: isProducerConnected,
		brokers: resolveKafkaBrokers(),
	};
}
