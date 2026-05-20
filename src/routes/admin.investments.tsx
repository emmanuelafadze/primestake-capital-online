import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Panel } from "@/components/dashboard/parts";
import { supabase } from "@/lib/supabase";

function Page() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { supabase.from("investments").select("*").order("created_at", { ascending: false }).limit(100).then(({ data }) => setRows(data ?? [])); }, []);
  const cols = [{key:"user_id",label:"User"},{key:"amount_usd",label:"Principal"},{key:"current_value_usd",label:"Current"},{key:"roi_percent",label:"ROI %"},{key:"started_at",label:"Started"}];
  return (<><PageHeader title="Investments" /><Panel>
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
export const Route = createFileRoute("/admin/investments")({ component: Page });
