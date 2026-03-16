import type { FastifyInstance } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { auth } from "./auth";
import { createUser } from "./create-user";
import { logout } from "./logout";
import { me } from "./me";
import { walletsUser } from "./wallets";
import { walletsUserPixGenerate } from "./wallets-me-pix-generate";
import { walletsMetricsChartData } from "./wallets-metrics-chart-data";
import { walletsMetricsMonthlySummary } from "./wallets-metrics-monthly-summary";
import { walletsPixResolve } from "./wallets-pix-resolve";

export const routes: FastifyPluginAsyncZod = async (app: FastifyInstance) => {
	app.register(auth, { prefix: "/auth/authenticate" });
	app.register(logout, { prefix: "/auth/logout" });
	app.register(createUser, { prefix: "/auth/create" });
	app.register(me, { prefix: "/auth/me" });
	app.register(walletsUser, { prefix: "/wallets" });
	app.register(walletsMetricsMonthlySummary, {
		prefix: "/wallets/metrics/monthly-summary",
	});
	app.register(walletsMetricsChartData, {
		prefix: "/wallets/metrics/chart-data",
	});
	app.register(walletsUserPixGenerate, { prefix: "/wallets/me/pix-generate" });
	app.register(walletsPixResolve, { prefix: "/wallets/pix-resolve" });
};
