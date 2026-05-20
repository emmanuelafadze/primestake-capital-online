import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { AuthLayout } from "@/components/site/AuthLayout";
import { Field } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Open an account — PrimeStake Capital" }] }),
  component: Signup,
});

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: name } },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created. Check your email to verify.");
    nav({ to: "/dashboard" });
  };

  return (
    <AuthLayout
      title="Open your account."
      subtitle="Two minutes to set up. Fund in your local currency."
      footer={
        <p className="text-center">
          Already a member?{" "}
          <Link to="/login" className="text-foreground underline underline-offset-4">Sign in</Link>
        </p>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <Field label="Full name" value={name} onChange={setName} placeholder="Jane Doe" />
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" />
        <button
          disabled={busy}
          className="h-12 w-full rounded-full bg-foreground text-sm font-medium text-background transition-transform hover:-translate-y-px disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create account"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          By signing up you agree to our terms and privacy policy.
        </p>
      </form>
    </AuthLayout>
  );
}
