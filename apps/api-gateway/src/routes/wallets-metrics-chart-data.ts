import { and, db, eq, gte, lte, transactions } from "@fintrack-pro/db";
import { eachDayOfInterval, format, startOfYear } from "date-fns";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { authenticate } from "@/middlewares/authenticate";

export const walletsMetricsChartData: FastifyPluginAsyncZod = async (
	app: FastifyInstance,
) => {
	app.get(
		"/",
		{
			schema: {
				summary: "Get wallet Metrics Chart Data of the current user",
				description:
					"get wallet metrics chart data of the currently authenticated user",
				tags: ["Wallets"],
				response: {
					200: z.object({
						data: z.array(
							z.object({
								date: z.string(),
								income: z.number(),
								expense: z.number(),
							}),
						),
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

			const endDate = new Date();

			const startDate = startOfYear(endDate);

			const rawTransactions = await db
				.select({
					type: transactions.type,
					amountInCents: transactions.amountInCents,
					createdAt: transactions.createdAt,
				})
				.from(transactions)
				.where(
					and(
						eq(transactions.userId, userId),
						gte(transactions.createdAt, startDate),
						lte(transactions.createdAt, endDate),
					),
				);

			const transactionsMap = rawTransactions.reduce(
				(acc, tx) => {
					const dayKey = format(tx.createdAt, "yyyy-MM-dd");
					if (!acc[dayKey]) {
						acc[dayKey] = { income: 0, expense: 0 };
					}

					if (tx.type === "income") {
						acc[dayKey].income += tx.amountInCents;
					}
					if (tx.type === "outcome") {
						acc[dayKey].expense += tx.amountInCents;
					}

					return acc;
				},
				{} as Record<string, { income: number; expense: number }>,
			);

			const chartData = eachDayOfInterval({
				start: startDate,
				end: endDate,
			}).map((dateObj) => {
				const dayKey = format(dateObj, "yyyy-MM-dd");
				const data = transactionsMap[dayKey] || {
					income: 0,
					expense: 0,
				};

				return {
					date: dayKey,
					income: data.income,
					expense: data.expense,
				};
			});

			console.log("walletsMetricsChartData", chartData);

			return response.send({
				data: chartData,
			});
		},
	);
};
