import { db, eq, users } from "@fintrack-pro/db";
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

			const [user] = await db.select().from(users).where(eq(users.id, userId));

			if (!user) {
				return response.code(401).send({ message: "User not found" });
			}

			return response.send({ id: user.id, name: user.name, email: user.email });
		},
	);
};
