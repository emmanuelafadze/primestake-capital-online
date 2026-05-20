import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Panel } from "@/components/dashboard/parts";
import { supabase } from "@/lib/supabase";

function makeAdminListRoute(table: string, title: string, columns: { key: string; label: string }[]) {
  return function Page() {
    const [rows, setRows] = useState<any[]>([]);
    useEffect(() => { supabase.from(table).select("*").order("created_at", { ascending: false }).limit(100).then(({ data }) => setRows(data ?? [])); }, []);
    return (
      <>
        <PageHeader title={title} />
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                {columns.map((c) => <th key={c.key} className="py-3 pr-4">{c.label}</th>)}
              </tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/60">
                    {columns.map((c) => <td key={c.key} className="py-3 pr-4">{String(r[c.key] ?? "—").slice(0, 60)}</td>)}
                  </tr>
                ))}
                {rows.length === 0 && <tr><td className="py-10 text-center text-muted-foreground" colSpan={columns.length}>No records.</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>
      </>
    );
  };
}

export const UsersRoute = createFileRoute("/admin/users")({ component: makeAdminListRoute("profiles", "Users", [
  { key: "email", label: "Email" }, { key: "full_name", label: "Name" }, { key: "country", label: "Country" }, { key: "created_at", label: "Joined" },
])});
export const Route = UsersRoute;
