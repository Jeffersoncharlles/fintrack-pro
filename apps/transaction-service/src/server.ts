import { connectKafka, consumer } from "./lib/kaafka";
import { processTransfer } from "./services/process-transfer";

const start = async () => {
	try {
		await connectKafka();
		await consumer.subscribe({
			topic: "transfer.requested",
			fromBeginning: true,
		});

		// 2. O Worker entra em modo de escuta
		await consumer.run({
			eachMessage: async ({ topic, partition, message }) => {
				const payload = JSON.parse(message.value?.toString() || "{}");

				console.log(`[EVENT] Mensagem recebida no tópico ${topic}`);

				await processTransfer(payload);
			},
		});
	} catch (err) {
		console.error("❌ Erro ao iniciar o Worker:", err);
		process.exit(1);
	}
};

start();
