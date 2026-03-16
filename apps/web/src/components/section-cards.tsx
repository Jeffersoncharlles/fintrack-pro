"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getWalletMetricsMonthlySummary } from "@/http/get-wallet-metrics-mothy-summary";

export function SectionCards() {
	const { data: metrics, isLoading } = useQuery({
		queryKey: ["metrics-monthly-summary"],
		queryFn: async () => {
			const metrics = await getWalletMetricsMonthlySummary();
			return metrics;
		},
	});

	return (
		<div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
			{metrics?.metrics.map((m) => (
				<Card key={m.type} className="@container/card">
					<CardHeader>
						<CardDescription>
							Total {m.type === "outcome" ? "Saldo" : "Retirada"}{" "}
						</CardDescription>
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							{m.totalAmount.toLocaleString("pt-BR", {
								style: "currency",
								currency: "BRL",
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</CardTitle>
						{/* <CardAction>
							<Badge variant="outline">
								<TrendingUpIcon />
								+12.5%
							</Badge>
						</CardAction> */}
					</CardHeader>
					<CardFooter className="flex-col items-start gap-1.5 text-sm">
						<div className="line-clamp-1 flex gap-2 font-medium">
							{m.type === "outcome" ? (
								<TrendingUpIcon className="size-4" />
							) : (
								<TrendingDownIcon className="size-4" />
							)}
						</div>
						<div className="text-muted-foreground">
							Valor Referente ao mes{" "}
							{metrics.month &&
								new Date(metrics.month).toLocaleString("pt-BR", {
									month: "long",
									year: "numeric",
								})}
						</div>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
