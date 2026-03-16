import { createRouter, RouterProvider } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth-context";
import { routeTree } from "@/routeTree.gen";

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

export const AppRouter = () => {
	const auth = useAuth();

	if (auth.loading) {
		return (
			<div className="flex h-screen items-center justify-center">
				Carregando...
			</div>
		);
	}

	return <RouterProvider router={router} context={{ auth }} />;
};
