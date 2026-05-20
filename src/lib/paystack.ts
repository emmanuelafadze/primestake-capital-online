import { supabase } from "@/lib/supabase";

declare global {
  interface Window { PaystackPop?: any }
}

const PAYSTACK_INLINE = "https://js.paystack.co/v1/inline.js";

let loaded = false;
async function loadScript() {
  if (loaded || (typeof window !== "undefined" && window.PaystackPop)) { loaded = true; return; }
  await new Promise<void>((res, rej) => {
    const s = document.createElement("script");
    s.src = PAYSTACK_INLINE; s.async = true;
    s.onload = () => { loaded = true; res(); };
    s.onerror = () => rej(new Error("Failed to load Paystack"));
    document.body.appendChild(s);
  });
}

export type PaystackArgs = {
  email: string;
  userId: string;
  amountUsd: number;
  localCurrency: string;
  localAmount: number;
  purpose: "deposit" | "purchase" | "investment";
  packageId?: string;
  onSuccess?: (reference: string) => void;
};

export async function payWithPaystack(args: PaystackArgs): Promise<void> {
  await loadScript();
  const pk = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string;
  const reference = `PSC_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return new Promise((resolve, reject) => {
    const handler = window.PaystackPop!.setup({
      key: pk,
      email: args.email,
      // Paystack expects amount in the smallest currency unit
      amount: Math.round(args.localAmount * 100),
      currency: args.localCurrency,
      ref: reference,
      metadata: {
        user_id: args.userId,
        purpose: args.purpose,
        package_id: args.packageId,
        amount_usd: args.amountUsd,
      },
      callback: (resp: { reference: string }) => {
        verify(resp.reference).then(() => {
          args.onSuccess?.(resp.reference);
          resolve();
        }).catch(reject);
      },
      onClose: () => reject(new Error("Payment cancelled")),
    });
    handler.openIframe();
  });
}

async function verify(reference: string) {
  const { data, error } = await supabase.functions.invoke("verify-paystack", {
    body: { reference },
  });
  if (error) throw error;
  if (!data?.verified) throw new Error("Verification failed");
  return data;
}
