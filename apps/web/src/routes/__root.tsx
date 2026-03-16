import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { AuthContextType } from "@/contexts/auth-context";

interface MyRouterContext {
	auth: AuthContextType;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: () => (
		<>
			<Outlet />
		</>
	),
});
