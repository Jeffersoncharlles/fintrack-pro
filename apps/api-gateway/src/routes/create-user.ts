import { db, eq, users } from "@fintrack-pro/db";
import bcrypt from "bcrypt";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

const createUserBodySchema = z.object({
	name: z.string(),
	email: z.string().email(),
	password: z.string().min(6),
});

type CreateUserBody = z.infer<typeof createUserBodySchema>;

export const createUser: FastifyPluginAsyncZod = async (
	app: FastifyInstance,
) => {
	app.post(
		"/",
		{
			schema: {
				summary: "Create user",
				description: "Create a new user account",
				tags: ["Users"],
				body: createUserBodySchema,
				response: {
					201: z.object({
						token: z.string(),
					}),
					401: z.object({
						message: z.string(),
					}),
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (
			request: FastifyRequest<{ Body: CreateUserBody }>,
			response: FastifyReply,
		) => {
			const { email, password, name } = request.body;
			const { jwtSign } = response;

			const [existingUser] = await db
				.select()
				.from(users)
				.where(eq(users.email, email));

			if (existingUser) {
				return response.code(401).send({ message: "User already exists" });
			}

			const passwordHash = await bcrypt.hash(password, 10);

			const [newUser] = await db
				.insert(users)
				.values({
					name,
					email,
					passwordHash,
				})
				.returning({ id: users.id });

			if (!newUser) {
				return response.code(500).send({ message: "Failed to create user" });
			}

			const token = await jwtSign({ userId: newUser.id }, { expiresIn: "7d" });

			return response.code(201).send({ token });
		},
	);
};
