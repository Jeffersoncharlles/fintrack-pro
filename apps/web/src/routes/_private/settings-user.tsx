import { createFileRoute } from "@tanstack/react-router";
import { SettingsUserPage } from "@/pages/settings-user";

export const Route = createFileRoute("/_private/settings-user")({
	component: SettingsUserPage,
});
