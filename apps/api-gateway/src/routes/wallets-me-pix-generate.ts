import { db, eq, wallets } from "@fintrack-pro/db";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { authenticate } from "@/middlewares/authenticate";

const walletsUserPixGenerateBodySchema = z.object({
	pixKey: z.uuid(),
});

export const walletsUserPixGenerate: FastifyPluginAsyncZod = async (
	app: FastifyInstance,
) => {
	app.patch(
		"/",
		{
			schema: {
				summary: "Get wallet Metrics Monthly Summary of the current user",
				description:
					"get wallet metrics monthly summary of the currently authenticated user",
				tags: ["Wallets"],
				body: walletsUserPixGenerateBodySchema,
				response: {
					200: z.object({
						message: z.string(),
						pixKey: z.string(),
					}),
					409: z.object({
						message: z.string(),
					}),
				},
			},
			preHandler: [authenticate],
		},

		async (request: FastifyRequest, response: FastifyReply) => {
			const userId = request.userId;
			const { pixKey } = walletsUserPixGenerateBodySchema.parse(request.body);

			const keyAlreadyExists = await db.query.wallets.findFirst({
				where: eq(wallets.pixKey, pixKey),
			});

			if (keyAlreadyExists) {
				if (keyAlreadyExists.userId === userId) {
					return response.send({
						message: "This Pix key is already associated with your wallet.",
					});
				}

				return response
					.status(409)
					.send({ message: "This Pix key is already in use." });
			}

			await db
				.update(wallets)
				.set({ pixKey })
				.where(eq(wallets.userId, userId));

			return response.send({
				message: "Pix key generated successfully.",
				pixKey,
			});
		},
	);
};
