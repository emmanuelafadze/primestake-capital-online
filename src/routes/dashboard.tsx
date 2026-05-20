import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/Shell";

export const Route = createFileRoute("/dashboard")({
  component: () => <DashboardShell mode="user"><Outlet /></DashboardShell>,
});
