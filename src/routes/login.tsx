import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Brand } from "@/components/site/Navbar";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — PrimeStake Capital" }] }),
  component: Login,
});

function Login() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back."); nav({ to: "/dashboard" });
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-10 shadow-[var(--shadow-elegant)]">
        <Link to="/"><Brand className="h-10" /></Link>
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Access your PrimeStake Capital dashboard.</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <Field label="Password" type="password" value={password} onChange={setPassword} />
          <button disabled={busy} className="h-12 w-full rounded-full bg-foreground text-sm font-medium text-background disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        <div className="mt-6 flex justify-between text-xs text-muted-foreground">
          <Link to="/forgot-password" className="hover:text-foreground">Forgot password?</Link>
          <Link to="/signup" className="hover:text-foreground">Open an account</Link>
        </div>
      </div>
    </div>
  );
}

export function Field({ label, type = "text", value, onChange }: { label: string; type?: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type={type} required value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none" />
    </label>
  );
}
