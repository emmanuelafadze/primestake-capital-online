import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Panel, StatCard } from "@/components/dashboard/parts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { formatUSD } from "@/lib/geo";
import { Wallet, Briefcase, ShoppingBag, TrendingUp } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/dashboard/")({
  component: Overview,
});

function Overview() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<{ balance_usd: number; managed_balance_usd: number } | null>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("wallets").select("balance_usd,managed_balance_usd").eq("user_id", user.id).maybeSingle().then(({ data }) => setWallet(data as any));
    supabase.from("purchases").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5).then(({ data }) => setPurchases(data ?? []));
    supabase.from("investment_history").select("*").eq("user_id", user.id).order("recorded_at").then(({ data }) => setHistory(data ?? []));
  }, [user]);

  return (
    <>
      <PageHeader title="Overview" subtitle="Snapshot of your wallet, releases, and managed performance." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Wallet" value={formatUSD(Number(wallet?.balance_usd ?? 0))} icon={<Wallet className="h-4 w-4" />} />
        <StatCard label="Managed balance" value={formatUSD(Number(wallet?.managed_balance_usd ?? 0))} icon={<Briefcase className="h-4 w-4" />} />
        <StatCard label="Active purchases" value={purchases.length} icon={<ShoppingBag className="h-4 w-4" />} />
        <StatCard label="Trailing ROI" value="—" hint="Active once first investment is recorded" icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Managed account growth">
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={history.map((h) => ({ date: new Date(h.recorded_at).toLocaleDateString(), balance: Number(h.balance_usd) }))}>
                  <CartesianGrid stroke="hsl(0 0% 92%)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="balance" stroke="#000" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {history.length === 0 && <p className="text-center text-sm text-muted-foreground">No managed activity yet. <Link to="/dashboard/account-management" className="underline">Begin onboarding →</Link></p>}
          </Panel>
        </div>
        <Panel title="Recent purchases">
          {purchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No purchases yet. <Link to="/dashboard/purchase" className="underline">Browse packages →</Link></p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {purchases.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <div><p className="font-medium">{formatUSD(Number(p.amount_usd))}</p><p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</p></div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs capitalize">{p.status.replace(/_/g, " ")}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
