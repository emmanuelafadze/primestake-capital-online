import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Panel, StatCard } from "@/components/dashboard/parts";
import { supabase } from "@/lib/supabase";
import { formatUSD } from "@/lib/geo";
import { Users, ShoppingBag, Briefcase, Wallet } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: AO });
function AO() {
  const [stats, setStats] = useState({ users: 0, purchases: 0, revenue: 0, managed: 0 });
  useEffect(() => {
    (async () => {
      const [u, p, t, w] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("purchases").select("id", { count: "exact", head: true }),
        supabase.from("transactions").select("amount_usd").eq("status", "success"),
        supabase.from("wallets").select("managed_balance_usd"),
      ]);
      setStats({
        users: u.count ?? 0,
        purchases: p.count ?? 0,
        revenue: (t.data ?? []).reduce((s, r: any) => s + Number(r.amount_usd), 0),
        managed: (w.data ?? []).reduce((s, r: any) => s + Number(r.managed_balance_usd), 0),
      });
    })();
  }, []);
  return (
    <>
      <PageHeader title="Admin Overview" subtitle="Platform health at a glance." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Members" value={stats.users} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Total purchases" value={stats.purchases} icon={<ShoppingBag className="h-4 w-4" />} />
        <StatCard label="Revenue (USD)" value={formatUSD(stats.revenue)} icon={<Wallet className="h-4 w-4" />} />
        <StatCard label="Managed funds" value={formatUSD(stats.managed)} icon={<Briefcase className="h-4 w-4" />} />
      </div>
      <Panel><p className="text-sm text-muted-foreground">Use the sidebar to manage users, packages, matches, KYC, withdrawals and more.</p></Panel>
    </>
  );
}
