"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getWalletMetricsMonthlySummary } from "@/http/get-wallet-metrics-mothy-summary";
import { Badge } from "./ui/badge";

export function SectionCards() {
	const { data: metrics, isLoading } = useQuery({
		queryKey: ["metrics-monthly-summary"],
		queryFn: async () => {
			const metrics = await getWalletMetricsMonthlySummary();
			return metrics;
		},
	});

	const income =
		metrics?.metrics.find((m) => m.type === "income")?.totalAmount ?? 0;
	const outcome =
		metrics?.metrics.find((m) => m.type === "outcome")?.totalAmount ?? 0;

	const totalMovement = income + outcome;

	const calculatePercentage = (value: number) => {
		if (totalMovement === 0) return 0;
		return Math.round((value / totalMovement) * 100);
	};

	const incomePercentage = calculatePercentage(income);
	const outcomePercentage = calculatePercentage(outcome);

	const displayMetrics = [
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

	if (isLoading) return <p>Carregando...</p>;

	return (
		<div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
			{displayMetrics.map((m) => {
				const isPositive = m.id === "income";
				const Icon = isPositive ? TrendingUpIcon : TrendingDownIcon;
				const sign = isPositive ? "+" : "-";

				return (
					<Card key={m.id} className="@container/card">
						<CardHeader>
							<CardDescription>Total {m.label} </CardDescription>
							<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
								{m.value.toLocaleString("pt-BR", {
									style: "currency",
									currency: "BRL",
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</CardTitle>
							<CardAction>
								<Badge variant="outline">
									<Icon />
									{sign}
									{m.percentage}%
								</Badge>
							</CardAction>
						</CardHeader>
						<CardFooter className="flex-col items-start gap-1.5 text-sm">
							<div className="line-clamp-1 flex gap-2 font-medium">
								{m.icon}
							</div>
							<div className="text-muted-foreground">
								Valor Referente ao mes{" "}
								{metrics?.month &&
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
