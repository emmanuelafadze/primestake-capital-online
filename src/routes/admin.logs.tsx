import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Panel } from "@/components/dashboard/parts";
import { supabase } from "@/lib/supabase";

function Page() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(100).then(({ data }) => setRows(data ?? [])); }, []);
  const cols = [{key:"admin_id",label:"Admin"},{key:"action",label:"Action"},{key:"target",label:"Target"},{key:"created_at",label:"Date"}];
  return (<><PageHeader title="Audit Log" /><Panel>
    <div className="overflow-x-auto"><table className="w-full text-sm">
      <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
        {cols.map((c) => <th key={c.key} className="py-3 pr-4">{c.label}</th>)}
      </tr></thead><tbody>
        {rows.map((r) => <tr key={r.id} className="border-b border-border/60">
          {cols.map((c) => <td key={c.key} className="py-3 pr-4">{String(r[c.key] ?? "—").slice(0, 80)}</td>)}
        </tr>)}
        {rows.length === 0 && <tr><td className="py-10 text-center text-muted-foreground" colSpan={cols.length}>No records.</td></tr>}
      </tbody></table></div>
  </Panel></>);
}
export const Route = createFileRoute("/admin/logs")({ component: Page });
