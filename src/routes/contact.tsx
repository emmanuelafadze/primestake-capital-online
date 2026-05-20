import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — PrimeStake Capital" },
      { name: "description", content: "Reach the PrimeStake Capital concierge team." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

const Schema = z.object({
  email: z.string().email().max(255),
  message: z.string().min(10).max(2000),
});

function Contact() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Schema.safeParse({ email, message });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    try {
      if (user) {
        await supabase.from("support_messages").insert({
          user_id: user.id, sender: "user", body: `[contact form] ${email}\n${message}`,
        });
      }
      toast.success("Message received. Our concierge will respond within 24 hours.");
      setMessage("");
    } catch (err: any) {
      toast.error(err.message || "Could not send");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight">Speak with our desk.</h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Members can also reach support directly inside the dashboard. The concierge desk responds within 24 hours.
          </p>
          <dl className="mt-10 space-y-6 text-sm">
            <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Concierge</dt><dd className="mt-1">concierge@primestakecapital.com</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Compliance</dt><dd className="mt-1">compliance@primestakecapital.com</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Hours</dt><dd className="mt-1">Monday — Sunday, 24/7</dd></div>
          </dl>
        </div>
        <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-8">
          <label className="block text-xs uppercase tracking-wider text-muted-foreground">Email</label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none"
          />
          <label className="mt-6 block text-xs uppercase tracking-wider text-muted-foreground">Message</label>
          <textarea
            required value={message} onChange={(e) => setMessage(e.target.value)} rows={8}
            className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none"
          />
          <button disabled={busy} className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background disabled:opacity-50">
            {busy ? "Sending…" : "Send message"}
          </button>
        </form>
      </section>
      <Footer />
    </div>
  );
}
