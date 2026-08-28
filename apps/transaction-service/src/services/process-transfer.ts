import { db, eq, transactions, wallets } from '@fintrack-pro/db'

interface ProcessTransferPayload {
  senderId: string
  receiverWalletId: string
  amountInCents: number
}

export async function processTransfer(payload: ProcessTransferPayload) {
  const { senderId, receiverWalletId, amountInCents } = payload

  try {
    await db.transaction(async (tx) => {
      const [senderWallet] = await tx
        .select()
        .from(wallets)
        .where(eq(wallets.userId, senderId))
        .for('update')

      if (!senderWallet) {
        throw new Error('Carteira do remetente não encontrada.')
      }

      if (senderWallet.balanceInCents < amountInCents) {
        throw new Error('Saldo insuficiente para a transação.')
      }

      const [receiverWallet] = await tx
        .select()
        .from(wallets)
        .where(eq(wallets.id, receiverWalletId))
        .for('update')

      if (!receiverWallet) {
        throw new Error('Carteira de destino não encontrada.')
      }

      await tx
        .update(wallets)
        .set({ balanceInCents: senderWallet.balanceInCents - amountInCents })
        .where(eq(wallets.id, senderWallet.id))
      await tx
        .update(wallets)
        .set({ balanceInCents: receiverWallet.balanceInCents + amountInCents })
        .where(eq(wallets.id, receiverWalletId))

      // 5. REGISTRAR O EXTRATO (History/Audit Log)
      await tx.insert(transactions).values([
        {
          userId: senderId,
          description: `Pix enviado para...`,
          amountInCents: amountInCents,
          type: 'outcome',
          category: 'transferência',
        },
        {
          userId: receiverWallet.userId,
          description: `Pix recebido de...`,
          amountInCents: amountInCents,
          type: 'income',
          category: 'transferência',
        },
      ])
    })
    console.log('✅ [SUCCESS] Transferência concluída e persistida no banco.')
  } catch (error: any) {
    console.error(
      '❌ [FATAL ERROR] Falha ao processar transferência:',
      error.message,
    )
    // Aqui você poderia enviar para um tópico de erro no Kafka (DLQ)
    // para notificar o front-end via WebSocket ou Push
  }
}
