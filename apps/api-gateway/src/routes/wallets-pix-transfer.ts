import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { producer } from "@/lib/kafka";
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
				// response: {
				// 	200: z.object({
				// 		incomeInCents: z.string().uuid(),
				// 		expenseInCents: z.number(),
				// 		month: z.coerce.date(),
				// 	}),
				// 	404: z.object({
				// 		message: z.string(),
				// 	}),
				// },
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
					topic: "transfer.requested",
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
				app.log.error(error);
				return response.status(500).send({
					message: "Ocorreu um erro ao tentar processar sua transferência.",
				});
			}
		},
	);
};
