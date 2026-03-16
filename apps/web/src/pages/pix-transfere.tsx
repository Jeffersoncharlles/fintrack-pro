import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { ArrowRight, Copy, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useFormatCurrencyFromCents } from "@/hooks/use-format-currency-from-cents";
import { getWalletPixResolver } from "@/http/get-wallet-pix-resolver";
import { walletPixTransfer } from "@/http/wallets-pix-transfer";

export function PixTransferPage() {
	const { user } = useAuth();
	const [step, setStep] = useState(1);
	const [pixKey, setPixKey] = useState("");
	const [amountInCents, setAmountInCents] = useState(0);
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const formatCurrencyFromCents = useFormatCurrencyFromCents();
	const amountDisplay = formatCurrencyFromCents(amountInCents);

	const {
		data: receiver,
		isFetching: isResolving,
		error: resolveError,
	} = useQuery({
		queryKey: ["pix-resolve", pixKey],
		queryFn: async () => getWalletPixResolver(pixKey),
		enabled: pixKey.length > 10,
		retry: false,
	});

	const { mutate: sendTransfer, isPending: isTransferring } = useMutation({
		mutationFn: async () => {
			if (!receiver?.receiverWalletId) {
				throw new Error("Selecione um favorecido antes de confirmar.");
			}

			await walletPixTransfer({
				receiverWalletId: receiver.receiverWalletId,
				amountInCents,
			});
		},
		onSuccess: () => {
			toast.success("Pix enviado para processamento!");
			queryClient.invalidateQueries({ queryKey: ["metrics-monthly-summary"] });
			navigate({ to: "/" });
		},
		onError: (err: unknown) => {
			if (isAxiosError<{ message?: string }>(err)) {
				toast.error(err.response?.data?.message || "Erro ao realizar Pix");
				return;
			}

			if (err instanceof Error) {
				toast.error(err.message || "Erro ao realizar Pix");
				return;
			}

			toast.error("Erro ao realizar Pix");
		},
	});

	const handleAmountChange = (rawValue: string) => {
		const digitsOnly = rawValue.replace(/\D/g, "");
		if (!digitsOnly) {
			setAmountInCents(0);
			return;
		}

		setAmountInCents(Number(digitsOnly));
	};

	const handleCopyOwnPixKey = async () => {
		if (!user?.pixKey) {
			toast.error("Voce ainda nao possui chave Pix cadastrada.");
			return;
		}

		try {
			await navigator.clipboard.writeText(user.pixKey);
			toast.success("Chave Pix copiada com sucesso.");
		} catch {
			toast.error("Nao foi possivel copiar a chave Pix.");
		}
	};

	return (
		<div className="flex flex-1 flex-col">
			<div className="@container/main flex flex-1 flex-col gap-2">
				<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
					<h1 className="text-2xl font-semibold">Transferencia Pix</h1>

					<div className="w-full max-w-xl">
						<Card>
							<CardHeader>
								<CardTitle>Enviar Pix</CardTitle>
								<CardDescription>
									Escolha o favorecido e confirme o valor da transferencia.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="p-4 rounded-lg border bg-muted/30 space-y-3">
									<p className="text-xs font-medium uppercase text-muted-foreground">
										Minha chave Pix
									</p>
									<div className="flex items-center gap-2">
										<Input
											readOnly
											value={user?.pixKey || "Voce ainda nao possui chave Pix."}
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={handleCopyOwnPixKey}
											disabled={!user?.pixKey}
										>
											<Copy className="size-4" />
											Copiar
										</Button>
									</div>
								</div>

								{step === 1 ? (
									<div className="space-y-4">
										<div className="relative">
											<Input
												placeholder="Cole a chave Pix do favorecido"
												value={pixKey}
												onChange={(e) => setPixKey(e.target.value)}
											/>
											{isResolving && (
												<Search className="absolute right-3 top-3 animate-spin size-4 opacity-50" />
											)}
										</div>

										{receiver && (
											<div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
												<div>
													<p className="text-xs text-emerald-700 font-medium uppercase">
														Favorecido
													</p>
													<p className="font-bold text-emerald-900">
														{receiver.receiverName}
													</p>
												</div>
												<Button
													type="button"
													size="sm"
													onClick={() => setStep(2)}
												>
													Avancar <ArrowRight className="ml-2 size-4" />
												</Button>
											</div>
										)}

										{resolveError && (
											<p className="text-sm text-destructive">
												Chave nao encontrada.
											</p>
										)}
									</div>
								) : (
									<div className="space-y-4 animate-in fade-in slide-in-from-right-4">
										<div>
											<p className="text-sm text-muted-foreground">
												Enviando para <b>{receiver?.receiverName}</b>
											</p>
											<Input
												type="text"
												inputMode="numeric"
												placeholder="R$ 0,00"
												className="text-2xl h-14 font-bold"
												value={amountDisplay}
												onChange={(e) => handleAmountChange(e.target.value)}
											/>
											<p className="text-xs text-muted-foreground mt-2">
												Valor exato da transferencia: <b>{amountDisplay}</b>
											</p>
										</div>
										<div className="grid grid-cols-2 gap-2">
											<Button
												type="button"
												variant="outline"
												onClick={() => setStep(1)}
											>
												Voltar
											</Button>
											<Button
												type="button"
												disabled={amountInCents <= 0 || isTransferring}
												onClick={() => sendTransfer()}
											>
												{isTransferring ? "Processando..." : "Confirmar envio"}
											</Button>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
