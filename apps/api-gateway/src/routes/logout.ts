import { db, eq } from "@fintrack-pro/db";
import { users } from "@fintrack-pro/db/src/schemas/users";
import bcrypt from "bcrypt";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import id from "zod/v4/locales/id.js";

const authenticateUserBodySchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

type AuthenticateUserBody = z.infer<typeof authenticateUserBodySchema>;

export const auth: FastifyPluginAsyncZod = async (app: FastifyInstance) => {
	app.post(
		"/",
		{
			schema: {
				summary: "logout user",
				description: "Logout user and invalidate the token",
				tags: ["Authentication"],
				body: authenticateUserBodySchema,
				// response: {
				// 	200: z.nullish(),
				// 	401: z.object({
				// 		message: z.string(),
				// 	}),
				// },
			},
		},
		async (
			request: FastifyRequest<{ Body: AuthenticateUserBody }>,
			response: FastifyReply,
		) => {},
	);
};
