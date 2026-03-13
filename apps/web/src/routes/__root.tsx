import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
	component: () => (
		<>
			<header className="border-b border-border bg-background/90">
				<nav className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-3 text-sm">
					<Link to="/" className="font-semibold text-foreground">
						Fintrack Pro
					</Link>
					<Link
						to="/authenticate"
						className="text-muted-foreground hover:text-foreground"
					>
						Authenticate
					</Link>
				</nav>
			</header>
			<Outlet />
		</>
	),
});
