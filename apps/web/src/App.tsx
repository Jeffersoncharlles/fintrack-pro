import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { AuthProvider } from "./contexts/auth-context";
import { queryClient } from "./lib/react-query";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
	routeTree,
	context: {
		auth: undefined!,
	},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const auth = true;

export const App = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<Toaster />
				<AuthProvider>
					<RouterProvider router={router} context={{ auth }} />
				</AuthProvider>
			</TooltipProvider>
		</QueryClientProvider>
	);
};
