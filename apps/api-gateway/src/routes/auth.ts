import { db, eq } from "@fintrack-pro/db";
import { users } from "@fintrack-pro/db/src/schemas/users";
import bcrypt from "bcrypt";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

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
				summary: "Authenticate user",
				description: "Authenticate user and return a token",
				tags: ["Authentication"],
				body: authenticateUserBodySchema,
				response: {
					200: z.object({
						token: z.string(),
						message: z.string(),
					}),
					401: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (
			request: FastifyRequest<{ Body: AuthenticateUserBody }>,
			response: FastifyReply,
		) => {
			const { email, password } = request.body;
			const { jwtSign } = response;

			const [userExists] = await db
				.select()
				.from(users)
				.where(eq(users.email, email));

			if (!userExists) {
				return response.code(401).send({ message: "Invalid credentials" });
			}

			const passwordHash = userExists.passwordHash;

			const isPasswordValid = await bcrypt.compare(password, passwordHash);

			if (!isPasswordValid) {
				return response.code(401).send({ message: "Invalid credentials" });
			}

			const token = await jwtSign(
				{ userId: userExists.id },
				{ expiresIn: "7d" },
			);

			return response
				.setCookie("tokens", token, {
					httpOnly: true,
					path: "/",
					maxAge: 60 * 60 * 24 * 7, // 7 dias,
				})
				.send({ token, message: "Authentication successful" });
		},
	);
};
