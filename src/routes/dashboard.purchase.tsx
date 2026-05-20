import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/parts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useGeo, formatLocal, formatUSD } from "@/lib/geo";
import { payWithPaystack } from "@/lib/paystack";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/purchase")({ component: Purchase });

function Purchase() {
  const [pkgs, setPkgs] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const { user } = useAuth(); const geo = useGeo(); const nav = useNavigate();

  useEffect(() => { supabase.from("packages").select("*").eq("active", true).order("price_usd").then(({ data }) => setPkgs(data ?? [])); }, []);

  const buy = async (p: any) => {
    if (!user) return;
    setBusy(p.id);
    try {
      await payWithPaystack({
        email: user.email!, userId: user.id, amountUsd: Number(p.price_usd),
        localCurrency: geo.currency, localAmount: Number(p.price_usd) * geo.rate,
        purpose: "purchase", packageId: p.id,
        onSuccess: () => { toast.success("Released to My Purchases."); nav({ to: "/dashboard/purchases" }); },
      });
    } catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  };

  return (
    <>
      <PageHeader title="Purchase Matches" subtitle="Select a package. Pay in your local currency. Access unlocks immediately on confirmation." />
      <div className="grid gap-4 md:grid-cols-3">
        {pkgs.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
            <p className="mt-4 text-3xl font-semibold">{formatUSD(Number(p.price_usd))}</p>
            {geo.currency !== "USD" && <p className="text-xs text-muted-foreground">≈ {formatLocal(Number(p.price_usd), geo)}</p>}
            <ul className="mt-4 space-y-1.5 text-sm">
              {(p.features as string[]).map((f) => <li key={f} className="flex gap-2"><CheckCircle2 className="h-4 w-4" />{f}</li>)}
            </ul>
            <button disabled={busy === p.id} onClick={() => buy(p)} className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background disabled:opacity-50">
              {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Purchase
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
