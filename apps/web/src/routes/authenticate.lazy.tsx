import { createLazyFileRoute } from "@tanstack/react-router";
import { AuthenticatePage } from "../pages/authenticate";

export const Route = createLazyFileRoute("/authenticate")({
	component: AuthenticatePage,
});
