import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { authenticate } from "@/middlewares/authenticate";

export const walletsPixResolve: FastifyPluginAsyncZod = async (
	app: FastifyInstance,
) => {
	app.get(
		"/",
		{
			schema: {
				summary: "Get wallet pix resolve of the current user",
				description:
					"get wallet pix resolve of the currently authenticated user",
				tags: ["Wallets"],
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

		async (request: FastifyRequest, response: FastifyReply) => {},
	);
};
