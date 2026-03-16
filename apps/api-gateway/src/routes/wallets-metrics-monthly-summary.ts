import { and, db, eq, gte, lte, sum, transactions } from "@fintrack-pro/db";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { authenticate } from "@/middlewares/authenticate";

export const walletsMetricsMonthlySummary: FastifyPluginAsyncZod = async (
	app: FastifyInstance,
) => {
	app.get(
		"/",
		{
			schema: {
				summary: "Get wallet Metrics Monthly Summary of the current user",
				description:
					"get wallet metrics monthly summary of the currently authenticated user",
				tags: ["Wallets"],
				response: {
					200: z.object({
						metrics: z.array(
							z.object({
								type: z.enum(["income", "outcome"]),
								totalAmount: z.number(),
							}),
						),
						month: z.coerce.date(),
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

			const now = new Date();
			const year = now.getFullYear();
			const month = now.getMonth();

			const startDate = new Date(year, month, 1); // Ex: 01/03/2026 00:00:00
			const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

			const monthlyData = await db
				.select({
					type: transactions.type,
					totalAmount: sum(transactions.amountInCents).mapWith(Number),
				})
				.from(transactions)
				.where(
					and(
						eq(transactions.userId, userId),
						gte(transactions.createdAt, startDate),
						lte(transactions.createdAt, endDate),
					),
				)
				.groupBy(transactions.type);

			return response.send({
				metrics: monthlyData,
				month: startDate,
			});
		},
	);
};
