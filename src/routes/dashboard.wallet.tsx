import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Panel, StatCard } from "@/components/dashboard/parts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useGeo, formatLocal, formatUSD } from "@/lib/geo";
import { payWithPaystack } from "@/lib/paystack";
import { toast } from "sonner";
import { Wallet as WalletIcon, Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/wallet")({ component: WalletPage });

function WalletPage() {
  const { user } = useAuth(); const geo = useGeo();
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState(100); const [busy, setBusy] = useState(false);
  const load = () => user && supabase.from("wallets").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => setWallet(data));
  useEffect(() => { load(); }, [user]);

  const deposit = async () => {
    if (!user || amount < 1) return;
    setBusy(true);
    try {
      await payWithPaystack({
        email: user.email!, userId: user.id, amountUsd: amount,
        localCurrency: geo.currency, localAmount: amount * geo.rate, purpose: "deposit",
        onSuccess: () => { toast.success("Wallet funded."); load(); },
      });
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Wallet" subtitle="Fund your wallet in your local currency. Use it for purchases and managed investments." />
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard label="Available balance" value={formatUSD(Number(wallet?.balance_usd ?? 0))} icon={<WalletIcon className="h-4 w-4" />} />
        <StatCard label="Managed balance" value={formatUSD(Number(wallet?.managed_balance_usd ?? 0))} />
      </div>
      <Panel title="Fund wallet" >
        <div className="flex flex-wrap items-end gap-4">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Amount (USD)</span>
            <input type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-2 w-48 rounded-lg border border-input bg-background px-4 py-3 text-sm" />
          </label>
          <p className="text-sm text-muted-foreground">≈ {formatLocal(amount, geo)} {geo.currency}</p>
          <button disabled={busy} onClick={deposit} className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Deposit via Paystack
          </button>
        </div>
      </Panel>
    </>
  );
}
