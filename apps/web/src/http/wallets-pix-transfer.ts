import { api } from '@/lib/axios'

interface PixTransferData {
  receiverWalletId: string
  amountInCents: number
}

export const walletPixTransfer = async ({
  receiverWalletId,
  amountInCents,
}: PixTransferData) => {
  await api.post('/wallets/pix-transfer', {
    receiverWalletId,
    amountInCents,
  })
}
