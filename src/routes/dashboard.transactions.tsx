import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Panel } from "@/components/dashboard/parts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { formatUSD } from "@/lib/geo";

export const Route = createFileRoute("/dashboard/transactions")({ component: Tx });

function Tx() {
  const { user } = useAuth(); const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { user && supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? [])); }, [user]);
  return (
    <>
      <PageHeader title="Transactions" />
      <Panel>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="py-3">Date</th><th>Type</th><th>Status</th><th>Reference</th><th className="text-right">Amount (USD)</th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/60">
                <td className="py-3">{new Date(r.created_at).toLocaleString()}</td>
                <td className="capitalize">{r.type}</td>
                <td className="capitalize">{r.status}</td>
                <td className="text-xs text-muted-foreground">{r.reference}</td>
                <td className="text-right font-medium">{formatUSD(Number(r.amount_usd))}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">No transactions yet.</td></tr>}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
