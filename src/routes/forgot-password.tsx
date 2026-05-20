import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Brand } from "@/components/site/Navbar";
import { Field } from "./login";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — PrimeStake Capital" }] }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("If an account exists, a reset link has been sent.");
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-10">
        <Link to="/"><Brand className="h-10" /></Link>
        <h1 className="mt-8 text-2xl font-semibold">Reset your password</h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <button disabled={busy} className="h-12 w-full rounded-full bg-foreground text-sm font-medium text-background">{busy ? "Sending…" : "Send reset link"}</button>
        </form>
        <p className="mt-6 text-center text-xs"><Link to="/login" className="text-muted-foreground hover:text-foreground">Back to sign in</Link></p>
      </div>
    </div>
  );
}
