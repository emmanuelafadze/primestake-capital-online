import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Panel } from "@/components/dashboard/parts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/notifications")({ component: N });
function N() {
  const { user } = useAuth(); const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    const load = () => supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
    load();
    const ch = supabase.channel("notif").on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);
  return (
    <>
      <PageHeader title="Notifications" />
      <Panel>
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No notifications.</p>}
        <ul className="divide-y divide-border">
          {rows.map((n) => (
            <li key={n.id} className="py-4">
              <p className="font-medium">{n.title}</p>
              <p className="text-sm text-muted-foreground">{n.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
