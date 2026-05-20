import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/dashboard/parts";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/settings")({ component: S });
function S() {
  const { signOut } = useAuth();
  return (
    <>
      <PageHeader title="Settings" subtitle="Account preferences and session." />
      <Panel title="Session">
        <button onClick={signOut} className="rounded-full border border-border px-5 py-2.5 text-sm">Sign out of all devices</button>
      </Panel>
    </>
  );
}
