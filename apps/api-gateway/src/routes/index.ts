import type { FastifyInstance } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { auth } from "./auth";
import { createUser } from "./create-user";
import { me } from "./me";
import { walletsUser } from "./wallets";

export const routes: FastifyPluginAsyncZod = async (app: FastifyInstance) => {
	app.register(auth, { prefix: "/auth/authenticate" });
	app.register(createUser, { prefix: "/auth/create" });
	app.register(me, { prefix: "/auth/me" });
	app.register(walletsUser, { prefix: "/wallets" });
};
