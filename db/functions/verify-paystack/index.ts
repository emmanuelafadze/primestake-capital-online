// Paystack payment verification edge function
// Deploy with: `supabase functions deploy verify-paystack --no-verify-jwt`
// Required secrets (set in Supabase Dashboard → Edge Functions → Secrets):
//   PAYSTACK_SECRET_KEY   sk_live_xxx
//   SUPABASE_URL          (auto-injected)
//   SUPABASE_SERVICE_ROLE_KEY (auto-injected)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

  try {
    const { reference } = await req.json();
    if (!reference) return json({ error: "Missing reference" }, 400);

    const psKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!psKey) return json({ error: "Paystack key missing" }, 500);

    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${psKey}` },
    });
    const data = await res.json();

    if (!data.status || data.data?.status !== "success") {
      return json({ verified: false, reason: data.message ?? "Not successful" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const meta = data.data.metadata ?? {};
    const userId = meta.user_id as string | undefined;
    const purpose = (meta.purpose as string | undefined) ?? "deposit"; // 'deposit' | 'purchase' | 'investment'
    const packageId = meta.package_id as string | undefined;
    const amountUsd = Number(meta.amount_usd ?? data.data.amount / 100);
    const localCurrency = data.data.currency;
    const localAmount = data.data.amount / 100;

    if (!userId) return json({ error: "metadata.user_id required" }, 400);

    // Idempotency check
    const { data: existing } = await supabase
      .from("transactions")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();
    if (existing) return json({ verified: true, idempotent: true });

    // Insert transaction
    await supabase.from("transactions").insert({
      user_id: userId,
      type: purpose === "purchase" ? "purchase" : purpose === "investment" ? "investment" : "deposit",
      status: "success",
      amount_usd: amountUsd,
      local_currency: localCurrency,
      local_amount: localAmount,
      reference,
      description: `Paystack ${purpose}`,
      metadata: meta,
    });

    if (purpose === "deposit") {
      const { data: w } = await supabase.from("wallets").select("balance_usd").eq("user_id", userId).maybeSingle();
      const newBal = Number(w?.balance_usd ?? 0) + amountUsd;
      await supabase.from("wallets").update({ balance_usd: newBal, updated_at: new Date().toISOString() }).eq("user_id", userId);
    }

    if (purpose === "purchase" && packageId) {
      // Auto-unlock per business rule (no admin approval after payment)
      await supabase.from("purchases").insert({
        user_id: userId,
        package_id: packageId,
        amount_usd: amountUsd,
        paystack_reference: reference,
        status: "released",
        unlocked_at: new Date().toISOString(),
      });
    }

    if (purpose === "investment") {
      const { data: w } = await supabase.from("wallets").select("managed_balance_usd").eq("user_id", userId).maybeSingle();
      const newBal = Number(w?.managed_balance_usd ?? 0) + amountUsd;
      await supabase.from("wallets").update({ managed_balance_usd: newBal, updated_at: new Date().toISOString() }).eq("user_id", userId);
      await supabase.from("investments").insert({
        user_id: userId,
        amount_usd: amountUsd,
        current_value_usd: amountUsd,
      });
      await supabase.from("investment_history").insert({
        user_id: userId,
        balance_usd: newBal,
        delta_usd: amountUsd,
        note: "Initial investment deposit",
      });
    }

    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Payment confirmed",
      body: `Your ${purpose} of $${amountUsd.toFixed(2)} was confirmed.`,
    });

    return json({ verified: true });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
