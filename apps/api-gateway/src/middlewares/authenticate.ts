import type { FastifyReply, FastifyRequest } from "fastify";

export async function authenticate(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	try {
		await request.jwtVerify();
		request.userId = (request.user as { userId: string }).userId;
	} catch {
		return reply.code(401).send({ message: "Unauthorized" });
	}
}
