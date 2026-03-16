import fastifyCookie from "@fastify/cookie";
import { fastifyCors } from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import { fastifySwagger } from "@fastify/swagger";
import { env } from "@fintrack-pro/env";
import ScalarApiReference from "@scalar/fastify-api-reference";
import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import {
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { routes } from "./routes";

const app = Fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(fastifyCors, {
	origin: "http://localhost:5173",
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	credentials: true,
});

app.register(fastifySwagger, {
	openapi: {
		info: {
			title: "webhook-inspector API",
			description: "API for capturing and inspecting webhooks requests",
			version: "1.0.0",
		},
	},
	transform: jsonSchemaTransform,
});

app.register(ScalarApiReference, {
	routePrefix: "/docs",
});

app.get("/", async (_request: FastifyRequest, _reply: FastifyReply) => {
	return { hello: "world" };
});

app.register(fastifyCookie);
app.register(fastifyJwt, {
	secret: env.JWT_SECRET,
	cookie: {
		cookieName: "tokens",
		signed: false,
	},
});

app.register(routes);

const start = async () => {
	try {
		await app.listen({ port: env.API_GATEWAY_PORT, host: "0.0.0.0" });
	} catch (error) {
		app.log.error(error);
		process.exit(1);
	}
};

start();
