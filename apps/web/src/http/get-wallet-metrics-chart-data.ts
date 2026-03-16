import { api } from "@/lib/axios";

interface GetWalletMetricsChartDataResponse {
	data: {
		date: string;
		income: number;
		expense: number;
	}[];
}
export const getWalletMetricsChartData =
	async (): Promise<GetWalletMetricsChartDataResponse | null> => {
		const { data } = await api.get<GetWalletMetricsChartDataResponse>(
			"/wallets/metrics/chart-data",
		);

		console.log("getWalletMetricsChartData", data.data);

		return data;
	};
