import type { FastifyInstance } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { getKafkaProducerHealth } from "@/lib/kafka";

export const healthKafka: FastifyPluginAsyncZod = async (
	app: FastifyInstance,
) => {
	app.get(
		"/",
		{
			schema: {
				summary: "Kafka producer health",
				description: "returns Kafka producer connection status",
				tags: ["health"],
				response: {
					200: z.object({
						service: z.literal("api-gateway"),
						component: z.literal("kafka-producer"),
						status: z.enum(["up", "down"]),
						connected: z.boolean(),
						brokers: z.array(z.string()),
						timestamp: z.string(),
					}),
					503: z.object({
						service: z.literal("api-gateway"),
						component: z.literal("kafka-producer"),
						status: z.enum(["up", "down"]),
						connected: z.boolean(),
						brokers: z.array(z.string()),
						timestamp: z.string(),
					}),
				},
			},
		},
		async (_request, reply) => {
			const health = getKafkaProducerHealth();
			const status = health.connected ? "up" : "down";

			return reply.status(health.connected ? 200 : 503).send({
				service: "api-gateway",
				component: "kafka-producer",
				status,
				connected: health.connected,
				brokers: health.brokers,
				timestamp: new Date().toISOString(),
			});
		},
	);
};
