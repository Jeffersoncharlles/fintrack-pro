import { db, eq, users, wallets } from "@fintrack-pro/db";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { authenticate } from "@/middlewares/authenticate";

export const me: FastifyPluginAsyncZod = async (app: FastifyInstance) => {
	app.get(
		"/",
		{
			schema: {
				summary: "Get current user",
				description:
					"Retrieve information about the currently authenticated user",
				tags: ["Users"],
				response: {
					200: z.object({
						id: z.string().uuid(),
						name: z.string(),
						email: z.string().email(),
						pixKey: z.string().nullable(),
					}),
					401: z.object({
						message: z.string(),
					}),
				},
			},
			preHandler: [authenticate],
		},

		async (request: FastifyRequest, response: FastifyReply) => {
			const userId = request.userId;

			const [result] = await db
				.select({
					id: users.id,
					name: users.name,
					email: users.email,
					pixKey: wallets.pixKey,
				})
				.from(users)
				.leftJoin(wallets, eq(wallets.userId, users.id))
				.where(eq(users.id, userId));

			if (!result) {
				return response.code(401).send({ message: "User not found" });
			}

			return response.send({
				id: result.id,
				name: result.name,
				email: result.email,
				pixKey: result.pixKey ?? null,
			});
		},
	);
};
