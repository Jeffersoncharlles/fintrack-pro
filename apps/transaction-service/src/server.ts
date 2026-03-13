import { env } from "@fintrack-pro/env";
import Fastify from "fastify";
import { connectKafka, producer } from "./lib/kaafka";

const app = Fastify({ logger: true });

app.post("/transactions", async (request, reply) => {
	const transaction = request.body; // O ideal é validar com Zod aqui!

	await producer.send({
		topic: "transaction-created",
		messages: [{ value: JSON.stringify(transaction) }],
	});

	return reply.status(201).send({ message: "Transaction sent to queue" });
});

const start = async () => {
	try {
		await connectKafka();
		await app.listen({ port: env.PORT, host: "0.0.0.0" });
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};

start();
