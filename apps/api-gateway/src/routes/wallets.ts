import { db, eq, wallets } from "@fintrack-pro/db";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { authenticate } from "@/middlewares/authenticate";

export const walletsUser: FastifyPluginAsyncZod = async (
	app: FastifyInstance,
) => {
	app.get(
		"/",
		{
			schema: {
				summary: "Get wallet of the current user",
				description: "get wallet of the currently authenticated user",
				tags: ["Wallets"],
				response: {
					200: z.object({
						walletId: z.string().uuid(),
						balance: z.number(),
						currency: z.string(),
					}),
					404: z.object({
						message: z.string(),
					}),
				},
			},
			preHandler: [authenticate],
		},

		async (request: FastifyRequest, response: FastifyReply) => {
			const userId = request.userId;

			const wallet = await db.query.wallets.findFirst({
				where: eq(wallets.userId, userId),
				columns: {
					id: true,
					balanceInCents: true,
					currency: true,
				},
			});

			if (!wallet) {
				return response.code(404).send({ message: "wallet not found" });
			}

			return response.send({
				walletId: wallet.id,
				balance: wallet.balanceInCents,
				currency: wallet.currency,
			});
		},
	);
};
