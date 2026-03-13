import "@fastify/jwt";
import "fastify";

declare global {
	namespace FastifyJwt {
		interface Payload {
			userId: string;
		}
	}
}

declare module "fastify" {
	interface FastifyRequest {
		userId: string;
	}
}
