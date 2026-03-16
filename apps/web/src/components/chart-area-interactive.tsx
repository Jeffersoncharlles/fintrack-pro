"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { getWalletMetricsChartData } from "@/http/get-wallet-metrics-chart-data";

export const description = "An interactive area chart";

const chartConfig = {
	expense: {
		label: "Saidas",
		color: "var(--chart-1)",
	},
	income: {
		label: "Entradas",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

export function ChartAreaInteractive() {
	const { data: chartData, isLoading } = useQuery({
		queryKey: ["wallet-metrics-chart-data"],
		queryFn: async () => {
			const response = await getWalletMetricsChartData();

			return response;
		},
	});

	const isMobile = useIsMobile();
	const [timeRange, setTimeRange] = React.useState("90d");

	React.useEffect(() => {
		if (isMobile) {
			setTimeRange("7d");
		}
	}, [isMobile]);

	const filteredData = React.useMemo(() => {
		const allData = chartData?.data ?? [];

		if (allData.length === 0) {
			return [];
		}

		let daysToSubtract = 90;
		if (timeRange === "30d") {
			daysToSubtract = 30;
		} else if (timeRange === "7d") {
			daysToSubtract = 7;
		}

		const latestDataDate = new Date(
			`${allData[allData.length - 1]?.date}T00:00:00`,
		);
		const startDate = new Date(latestDataDate);
		startDate.setDate(startDate.getDate() - (daysToSubtract - 1));

		return allData.filter((item) => {
			const date = new Date(`${item.date}T00:00:00`);
			return date >= startDate && date <= latestDataDate;
		});
	}, [chartData?.data, timeRange]);

	return (
		<Card className="@container/card">
			<CardHeader>
				<CardTitle>Fluxo Diario</CardTitle>
				<CardDescription>
					<span className="hidden @[540px]/card:block">
						Entradas e saídas no periodo selecionado
					</span>
					<span className="@[540px]/card:hidden">Periodo selecionado</span>
				</CardDescription>
				<CardAction>
					<ToggleGroup
						type="single"
						value={timeRange}
						onValueChange={setTimeRange}
						variant="outline"
						className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
					>
						<ToggleGroupItem value="90d">Ultimos 90 dias</ToggleGroupItem>
						<ToggleGroupItem value="30d">Ultimos 30 dias</ToggleGroupItem>
						<ToggleGroupItem value="7d">Ultimos 7 dias</ToggleGroupItem>
					</ToggleGroup>
					<Select value={timeRange} onValueChange={setTimeRange}>
						<SelectTrigger
							className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
							size="sm"
							aria-label="Select a value"
						>
							<SelectValue placeholder="Ultimos 90 dias" />
						</SelectTrigger>
						<SelectContent className="rounded-xl">
							<SelectItem value="90d" className="rounded-lg">
								Ultimos 90 dias
							</SelectItem>
							<SelectItem value="30d" className="rounded-lg">
								Ultimos 30 dias
							</SelectItem>
							<SelectItem value="7d" className="rounded-lg">
								Ultimos 7 dias
							</SelectItem>
						</SelectContent>
					</Select>
				</CardAction>
			</CardHeader>
			<CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
				{isLoading ? (
					<div className="flex h-62.5 items-center justify-center text-sm text-muted-foreground">
						Carregando dados...
					</div>
				) : (
					<ChartContainer
						config={chartConfig}
						className="aspect-auto h-62.5 w-full"
					>
						<AreaChart data={filteredData}>
							<defs>
								<linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
									<stop
										offset="5%"
										stopColor="var(--color-expense)"
										stopOpacity={1.0}
									/>
									<stop
										offset="95%"
										stopColor="var(--color-expense)"
										stopOpacity={0.1}
									/>
								</linearGradient>
								<linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
									<stop
										offset="5%"
										stopColor="var(--color-income)"
										stopOpacity={0.8}
									/>
									<stop
										offset="95%"
										stopColor="var(--color-income)"
										stopOpacity={0.1}
									/>
								</linearGradient>
							</defs>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="date"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								minTickGap={32}
								tickFormatter={(value) => {
									const date = new Date(value);
									return date.toLocaleDateString("pt-BR", {
										month: "short",
										day: "numeric",
									});
								}}
							/>
							<ChartTooltip
								cursor={false}
								content={
									<ChartTooltipContent
										labelFormatter={(value) => {
											return new Date(value).toLocaleDateString("pt-BR", {
												month: "short",
												day: "numeric",
											});
										}}
										indicator="dot"
									/>
								}
							/>
							<Area
								dataKey="expense"
								type="natural"
								fill="url(#fillExpense)"
								stroke="var(--color-expense)"
							/>
							<Area
								dataKey="income"
								type="natural"
								fill="url(#fillIncome)"
								stroke="var(--color-income)"
							/>
						</AreaChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
