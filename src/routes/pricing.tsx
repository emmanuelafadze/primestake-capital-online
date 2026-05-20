import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useGeo, formatLocal, formatUSD } from "@/lib/geo";
import { payWithPaystack } from "@/lib/paystack";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — PrimeStake Capital" },
      { name: "description", content: "Single, Combo and Premium correct score packages. Pay in your local currency via Paystack." },
      { property: "og:url", content: "/pricing" },
    ],
    links: [{ rel: "canonical", href: "/pricing" }],
  }),
  component: Pricing,
});

type Pkg = { id: string; slug: string; name: string; description: string; price_usd: number; features: string[]; active: boolean };

function Pricing() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const geo = useGeo();
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    supabase.from("packages").select("*").eq("active", true).order("price_usd", { ascending: true })
      .then(({ data }) => setPackages((data as Pkg[]) ?? []));
  }, []);

  const buy = async (pkg: Pkg) => {
    if (!user) { nav({ to: "/login" }); return; }
    setBusy(pkg.id);
    try {
      await payWithPaystack({
        email: user.email!,
        userId: user.id,
        amountUsd: pkg.price_usd,
        localCurrency: geo.currency,
        localAmount: pkg.price_usd * geo.rate,
        purpose: "purchase",
        packageId: pkg.id,
        onSuccess: () => {
          toast.success("Purchase confirmed — released to your dashboard.");
          nav({ to: "/dashboard/purchases" });
        },
      });
    } catch (e: any) {
      toast.error(e.message || "Payment failed");
    } finally { setBusy(null); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pricing</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight">Three tiers. Transparent pricing.</h1>
          <p className="mt-4 text-muted-foreground">
            Prices shown in USD and your local currency ({geo.currency}). Paystack settles in your local currency at checkout.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {packages.map((p, i) => {
            const featured = i === 1;
            return (
              <div key={p.id} className={`flex flex-col rounded-3xl border p-8 ${featured ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`}>
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <p className={`mt-1 text-sm ${featured ? "text-background/70" : "text-muted-foreground"}`}>{p.description}</p>
                <div className="mt-6">
                  <p className="text-5xl font-semibold tracking-tight">{formatUSD(p.price_usd)}</p>
                  {geo.currency !== "USD" && (
                    <p className={`mt-1 text-sm ${featured ? "text-background/70" : "text-muted-foreground"}`}>
                      ≈ {formatLocal(p.price_usd, geo)} {geo.currency}
                    </p>
                  )}
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{f}</li>
                  ))}
                </ul>
                <button
                  disabled={busy === p.id}
                  onClick={() => buy(p)}
                  className={`mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-medium ${
                    featured ? "bg-background text-foreground" : "border border-foreground text-foreground hover:bg-foreground hover:text-background"
                  }`}
                >
                  {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Purchase
                </button>
              </div>
            );
          })}
          {packages.length === 0 && <p className="text-sm text-muted-foreground md:col-span-3">Loading packages…</p>}
        </div>
      </section>
      <Footer />
    </div>
  );
}
