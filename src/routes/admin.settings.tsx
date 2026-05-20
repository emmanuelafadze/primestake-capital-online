import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/dashboard/parts";
export const Route = createFileRoute("/admin/settings")({ component: () => (<><PageHeader title="Admin Settings" /><Panel><p className="text-sm text-muted-foreground">Configure platform-wide settings here.</p></Panel></>) });
