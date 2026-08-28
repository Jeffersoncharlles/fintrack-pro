import { api } from '@/lib/axios'

interface GetWalletPixResolverResponse {
  receiverName: string
  receiverWalletId: string
}

export const getWalletPixResolver = async (
  pixKey: string,
): Promise<GetWalletPixResolverResponse> => {
  const { data } = await api.get<GetWalletPixResolverResponse>(
    `/wallets/pix-resolve/${encodeURIComponent(pixKey)}`,
  )

  return data
}
