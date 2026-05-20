import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Panel } from "@/components/dashboard/parts";
import { supabase } from "@/lib/supabase";

function makeTable(table: string, title: string, cols: { key: string; label: string }[]) {
  return function Page() {
    const [rows, setRows] = useState<any[]>([]);
    useEffect(() => { supabase.from(table).select("*").order("created_at", { ascending: false }).limit(100).then(({ data }) => setRows(data ?? [])); }, []);
    return (<><PageHeader title={title} /><Panel>
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
  };
}
export const Route = createFileRoute("/admin/packages")({ component: makeTable("packages", "Packages", [
  { key: "name", label: "Name" }, { key: "price_usd", label: "Price" }, { key: "active", label: "Active" }, { key: "slug", label: "Slug" },
])});
