import { createRouter, RouterProvider } from "@tanstack/react-router";
import { Spinner } from "@/components/ui/spinner";
import { type AuthContextType, useAuth } from "@/contexts/auth-context";
import { routeTree } from "@/routeTree.gen";

const router = createRouter({
	routeTree,
	context: {
		auth: {
			user: null,
			isAuthenticated: false,
			loading: true,
			signIn: async () => ({
				success: false,
				error: "Auth context not initialized",
			}),
			signOut: async () => {},
		} satisfies AuthContextType,
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
				<Spinner className="h-12 w-12" />
			</div>
		);
	}

	return <RouterProvider router={router} context={{ auth }} />;
};
