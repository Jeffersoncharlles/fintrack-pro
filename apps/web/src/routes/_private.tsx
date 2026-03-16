import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import type React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

function PrivateLayout() {
	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}

export const Route = createFileRoute("/_private")({
	beforeLoad: ({ context }) => {
		console.log(
			"[DEBUG] _private beforeLoad - isAuthenticated:",
			context.auth.isAuthenticated,
			"user:",
			context.auth.user,
		);
		if (!context.auth.isAuthenticated) {
			console.log("[DEBUG] Not authenticated, redirecting to /authenticate");
			throw redirect({ to: "/authenticate" });
		}
		console.log("[DEBUG] Authenticated, allowing access to /_private");
	},

	component: PrivateLayout,
});
