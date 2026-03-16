import { createFileRoute } from "@tanstack/react-router";
import { RelatoryMonthsPage } from "@/pages/relatory-months";

export const Route = createFileRoute("/_private/relatory-months")({
	component: RelatoryMonthsPage,
});
