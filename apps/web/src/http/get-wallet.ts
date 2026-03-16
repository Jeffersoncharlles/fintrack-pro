import { api } from "@/lib/axios";

interface GetWalletResponse {
	walletId: string;
	balance: string;
	currency: string;
}
export const getWallet = async (): Promise<GetWalletResponse | null> => {
	const { data } = await api.get<GetWalletResponse>("/wallets");

	return data;
};
