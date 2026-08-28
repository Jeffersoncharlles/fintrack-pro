import { api } from '@/lib/axios'

interface GetWalletMetricsMonthlySummaryResponse {
  metrics: {
    type: 'income' | 'outcome'
    totalAmount: number
  }[]
  month: string
}
export const getWalletMetricsMonthlySummary =
  async (): Promise<GetWalletMetricsMonthlySummaryResponse | null> => {
    const { data } = await api.get<GetWalletMetricsMonthlySummaryResponse>(
      '/wallets/metrics/monthly-summary',
    )

    return data
  }
