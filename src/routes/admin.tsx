import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/Shell";

export const Route = createFileRoute("/admin")({
  component: () => <DashboardShell mode="admin"><Outlet /></DashboardShell>,
});
