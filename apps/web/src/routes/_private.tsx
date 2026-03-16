import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_private")({
	beforeLoad: ({ context }) => {
		// console.log(
		// 	"Segurança da balada viu isAuthenticated como:",
		// 	context.auth.isAuthenticated,
		// );
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/authenticate" });
		}
	},

	component: () => <Outlet />,
});
