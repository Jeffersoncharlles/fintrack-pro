import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const logout: FastifyPluginAsyncZod = async (app: FastifyInstance) => {
	app.post(
		"/",
		{
			schema: {
				summary: "logout user",
				description: "Logout user and invalidate the token",
				tags: ["Authentication"],
				response: {
					200: z.object({
						message: z.string(),
					}),
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request: FastifyRequest, response: FastifyReply) => {
			try {
				return response
					.clearCookie("tokens", { path: "/" })
					.send({ message: "Logout successful" });
			} catch (error) {
				request.log.error(error);
				return response.status(500).send({ message: "Fatal error internal" });
			}
		},
	);
};
