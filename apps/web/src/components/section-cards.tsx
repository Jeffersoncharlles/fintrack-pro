"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingDownIcon, TrendingUpIcon, Wallet } from "lucide-react";

import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useFormatCurrencyFromCents } from "@/hooks/use-format-currency-from-cents";
import { getWallet } from "@/http/get-wallet";
import { getWalletMetricsMonthlySummary } from "@/http/get-wallet-metrics-mothy-summary";
import { Badge } from "./ui/badge";

export function SectionCards() {
	const formatCurrencyFromCents = useFormatCurrencyFromCents();

	const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
		queryKey: ["metrics-monthly-summary"],
		queryFn: async () => {
			const metrics = await getWalletMetricsMonthlySummary();
			return metrics;
		},
		refetchInterval: 4000,
		refetchIntervalInBackground: false,
	});

	const { data: wallet, isLoading: isLoadingWallet } = useQuery({
		queryKey: ["wallet"],
		queryFn: async () => {
			const wallet = await getWallet();
			return wallet;
		},
		refetchInterval: 4000,
		refetchIntervalInBackground: false,
	});

	const income =
		metrics?.metrics?.find((m) => m.type === "income")?.totalAmount ?? 0;
	const outcome =
		metrics?.metrics?.find((m) => m.type === "outcome")?.totalAmount ?? 0;

	const totalMovement = income + outcome;

	const calculatePercentage = (value: number) => {
		if (totalMovement === 0) return 0;
		return Math.round((value / totalMovement) * 100);
	};

	const incomePercentage = calculatePercentage(income);
	const outcomePercentage = calculatePercentage(outcome);

	const displayMetrics = [
		{
			id: "balance",
			label: "Saldo total",
			value: wallet?.balance ?? 0,
			percentage: null,
			icon: <Wallet className="size-4 text-primary" />,
			description: "Saldo atual da conta",
		},
		{
			id: "income",
			label: "Entradas",
			value: income,
			percentage: incomePercentage,
			icon: <TrendingUpIcon className="size-4 text-emerald-500" />,
			description: "Total recebido",
		},
		{
			id: "outcome",
			label: "Saídas",
			value: outcome,
			percentage: outcomePercentage,
			icon: <TrendingDownIcon className="size-4 text-rose-500" />,
			description: "Total de gastos",
		},
	];

	if (isLoadingMetrics || isLoadingWallet) return <p>Carregando...</p>;

	return (
		<div className="grid grid-cols-1 gap-4 px-4 lg:px-6 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
			{displayMetrics.map((m) => {
				const isPositive = m.id === "income";
				const Icon = isPositive ? TrendingUpIcon : TrendingDownIcon;
				const sign = isPositive ? "+" : "-";
				const showTrend = m.id === "income" || m.id === "outcome";

				return (
					<Card key={m.id} className="@container/card h-full">
						<CardHeader className="gap-2">
							<CardDescription>Total {m.label} </CardDescription>
							<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
								{formatCurrencyFromCents(m.value)}
							</CardTitle>
							{showTrend && (
								<CardAction>
									<Badge variant="outline">
										<Icon />
										{sign}
										{m.percentage}%
									</Badge>
								</CardAction>
							)}
						</CardHeader>
						<CardFooter className="mt-auto flex-col items-start gap-1.5 text-sm">
							<div className="line-clamp-1 flex gap-2 font-medium">
								{m.icon}
								{m.description}
							</div>
							<div className="text-muted-foreground text-xs">
								{m.id === "balance"
									? "Atualizado em tempo real."
									: "Valor referente ao mes "}
								{metrics?.month &&
									m.id !== "balance" &&
									new Date(metrics.month).toLocaleString("pt-BR", {
										month: "long",
										year: "numeric",
									})}
							</div>
						</CardFooter>
					</Card>
				);
			})}
		</div>
	);
}
