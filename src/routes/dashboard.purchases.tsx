import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Panel } from "@/components/dashboard/parts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { formatUSD } from "@/lib/geo";
import { Lock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/purchases")({ component: MyPurchases });

function MyPurchases() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("purchases").select("*, packages(name)").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
  }, [user]);
  return (
    <>
      <PageHeader title="My Purchases" subtitle="Released tickets unlock automatically. Pending tickets remain locked until payment confirmation." />
      <div className="grid gap-4 md:grid-cols-2">
        {rows.length === 0 && <Panel><p className="text-sm text-muted-foreground">No purchases yet.</p></Panel>}
        {rows.map((p) => {
          const unlocked = ["released", "won", "lost", "void", "approved"].includes(p.status);
          return (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">{p.packages?.name ?? "Package"}</h3>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs capitalize">{p.status.replace(/_/g, " ")}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</p>
              <p className="mt-4 text-2xl font-semibold">{formatUSD(Number(p.amount_usd))}</p>
              <div className={`mt-6 rounded-xl border p-4 ${unlocked ? "border-success/30 bg-success/5" : "border-border bg-secondary/40"}`}>
                {unlocked ? (
                  <div className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                    <div><p className="font-medium">Ticket released</p><p className="text-xs text-muted-foreground">Match details available — refer to your concierge channel for the live release.</p></div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 text-sm">
                    <Lock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div><p className="font-medium">Awaiting confirmation</p><p className="text-xs text-muted-foreground">Your ticket unlocks the moment Paystack confirms payment.</p></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
