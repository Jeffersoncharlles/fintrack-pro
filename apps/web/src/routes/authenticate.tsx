import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthenticatePage } from "@/pages/authenticate";

export const Route = createFileRoute("/authenticate")({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: "/" });
		}
	},
	component: AuthenticatePage,
});
