import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Field } from "./login";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set new password — PrimeStake Capital" }] }),
  component: Reset,
});

function Reset() {
  const [password, setPassword] = useState(""); const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated."); nav({ to: "/dashboard" });
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-10">
        <h1 className="text-2xl font-semibold">Set a new password</h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <Field label="New password" type="password" value={password} onChange={setPassword} />
          <button disabled={busy} className="h-12 w-full rounded-full bg-foreground text-sm font-medium text-background">{busy ? "Saving…" : "Update password"}</button>
        </form>
      </div>
    </div>
  );
}
