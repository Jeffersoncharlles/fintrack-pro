import { db, eq, users, wallets } from "@fintrack-pro/db";
import type { FastifyInstance } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { authenticate } from "@/middlewares/authenticate";

const walletsPixResolveBodySchema = z.object({
	pixKey: z.uuid(),
});

export const walletsPixResolve: FastifyPluginAsyncZod = async (
	app: FastifyInstance,
) => {
	app.get<{
		Params: z.infer<typeof walletsPixResolveBodySchema>;
	}>(
		"/:pixKey",
		{
			schema: {
				summary: "Get wallet pix resolve of the current user",
				description:
					"get wallet pix resolve of the currently authenticated user",
				tags: ["Wallets"],
				params: walletsPixResolveBodySchema,
				response: {
					200: z.object({
						receiverName: z.string(),
						receiverWalletId: z.string().uuid(),
					}),
					404: z.object({
						message: z.string(),
					}),
					400: z.object({
						message: z.string(),
					}),
				},
			},
			preHandler: [authenticate],
		},

		async (request, response) => {
			const userId = request.userId;
			const { pixKey } = request.params;

			const [result] = await db
				.select({
					walletId: wallets.id,
					userName: users.name,
					ownerId: users.id,
				})
				.from(wallets)
				.innerJoin(users, eq(wallets.userId, users.id))
				.where(eq(wallets.pixKey, pixKey));

			if (!result) {
				return response.code(404).send({ message: "pix key not found" });
			}

			if (result.ownerId === userId) {
				return response.code(400).send({ message: "pix key belongs to you" });
			}

			const maskName = (name: string) => {
				const parts = name.split(" ");
				if (parts.length < 2) return `${name.substring(0, 3)}***`;
				return `${parts[0].substring(0, 3)}*** ${parts[parts.length - 1].substring(0, 3)}***`;
			};

			return response.send({
				receiverName: maskName(result.userName),
				receiverWalletId: result.walletId,
			});
		},
	);
};
