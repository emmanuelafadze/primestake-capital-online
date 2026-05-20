import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Brand } from "@/components/site/Navbar";
import { Field } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Open an account — PrimeStake Capital" }] }),
  component: Signup,
});

function Signup() {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false); const nav = useNavigate();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: name } },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created. Check your email to verify."); nav({ to: "/dashboard" });
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-10 shadow-[var(--shadow-elegant)]">
        <Link to="/"><Brand className="h-10" /></Link>
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">Open an account</h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <Field label="Full name" value={name} onChange={setName} />
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <Field label="Password" type="password" value={password} onChange={setPassword} />
          <button disabled={busy} className="h-12 w-full rounded-full bg-foreground text-sm font-medium text-background disabled:opacity-60">{busy ? "Creating…" : "Create account"}</button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">Already a member? <Link to="/login" className="text-foreground underline">Sign in</Link></p>
      </div>
    </div>
  );
}
