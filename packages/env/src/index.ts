import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string().url(),
	KAFKA_BROKERS: z.string().default("localhost:9092"),
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),
	PORT: z.coerce.number().default(3000),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
	console.error("❌ variables not valid:", _env.error.format());
	throw new Error("variables not valid.");
}

export const env = _env.data;
