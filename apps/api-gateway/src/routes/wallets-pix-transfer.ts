import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { producer, topicName } from "@/lib/kafka";
import { authenticate } from "@/middlewares/authenticate";

const walletsPixTransferBodySchema = z.object({
	receiverWalletId: z.string().uuid("ID da carteira de destino inválido"),
	amountInCents: z.number().positive("O valor deve ser maior que zero"),
});

export const walletsPixTransfer: FastifyPluginAsyncZod = async (
	app: FastifyInstance,
) => {
	app.post(
		"/",
		{
			schema: {
				summary: "Get wallet pix transfer of the current user",
				description:
					"get wallet pix transfer of the currently authenticated user",
				tags: ["payments"],
				body: walletsPixTransferBodySchema,
				response: {
					202: z.object({
						message: z.string(),
						transactionId: z.string().uuid(),
					}),
					401: z.object({
						message: z.string(),
					}),
					502: z.object({
						message: z.string(),
						error: z.string(),
						transactionId: z.string().uuid(),
					}),
				},
			},
			preHandler: [authenticate],
		},

		async (request: FastifyRequest, response: FastifyReply) => {
			const senderId = request.userId;
			const { receiverWalletId, amountInCents } = request.body as z.infer<
				typeof walletsPixTransferBodySchema
			>;

			const transactionId = crypto.randomUUID();

			try {
				await producer.send({
					topic: topicName("transfer.requested"),
					messages: [
						{
							key: senderId,
							value: JSON.stringify({
								transactionId,
								senderId,
								receiverWalletId,
								amountInCents,
								timestamp: new Date().toISOString(),
							}),
						},
					],
				});
				return response.status(202).send({
					message: "Transferência enviada para processamento.",
					transactionId,
				});
			} catch (error) {
				const kafkaError = error as {
					name?: string;
					message?: string;
					type?: string;
					retriable?: boolean;
				};

				app.log.error({
					transactionId,
					senderId,
					receiverWalletId,
					amountInCents,
					kafkaError,
				});

				return response.status(502).send({
					message: "Falha ao publicar a transferência para processamento.",
					error:
						kafkaError.message || kafkaError.name || "Kafka publish failed",
					transactionId,
				});
			}
		},
	);
};
