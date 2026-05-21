import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ArrowUpRight, ShieldCheck, LineChart, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import hero from "@/assets/hero.jpg";
import marble from "@/assets/texture-marble.jpg";
import dashboardPreview from "@/assets/dashboard-preview.jpg";
import chatPreview from "@/assets/chat-preview.jpg";
import t1 from "@/assets/testimonial-1.jpg";
import t2 from "@/assets/testimonial-2.jpg";
import t3 from "@/assets/testimonial-3.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PrimeStake Capital — Elite Sports Capital Management" },
      { name: "description", content: "Private intelligence desk for vetted sporting investments and managed account growth. Built for serious capital." },
      { property: "og:title", content: "PrimeStake Capital" },
      { property: "og:description", content: "Elite sports capital management." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Landing,
});

const stats = [
  { k: "Members", v: "12,400+" },
  { k: "Capital under management", v: "$28M" },
  { k: "Strike rate (12-mo)", v: "91.4%" },
  { k: "Average member ROI", v: "37%" },
];

const features = [
  { icon: ShieldCheck, title: "Verified intelligence", body: "Every release is cross-validated by our analyst desk before reaching members. No noise, no gambling on guesses." },
  { icon: Lock, title: "Locked release cycles", body: "Tickets stay encrypted until the moment of release. Information advantage is preserved end-to-end." },
  { icon: LineChart, title: "Managed account growth", body: "Hand off capital to our portfolio team and watch performance compound under disciplined risk control." },
  { icon: Sparkles, title: "Concierge support", body: "Direct line to a senior associate for KYC, withdrawals, and portfolio adjustments — 24/7." },
];

const testimonials = [
  { img: t1, name: "Amara Okafor", role: "Member since 2023", quote: "Single most disciplined sports capital desk I've worked with. Every release feels engineered, not guessed." },
  { img: t2, name: "Marcus Lindgren", role: "Managed account, $50K", quote: "The KYC was rigorous — which is exactly what gave me the confidence to scale my managed position." },
  { img: t3, name: "Daniel Vega", role: "Premium tier", quote: "Three correct scores in a row. The first time I saw it land I knew this wasn't the usual market." },
];

const faqs = [
  { q: "How do release cycles work?", a: "Each ticket is encrypted server-side and only unlocks in your dashboard once payment is confirmed by Paystack. You retain a permanent record under My Purchases." },
  { q: "What is Account Management?", a: "After KYC approval you can place capital into a managed account. Our desk operates positions and reports performance in real time inside your dashboard." },
  { q: "Which currencies are supported?", a: "We bill in your local currency where Paystack supports it (NGN, GHS, ZAR, KES, EGP, XOF) and default to USD elsewhere. Conversion happens automatically at checkout." },
  { q: "How are withdrawals processed?", a: "Withdrawal requests enter a review queue and are released by our operations team after compliance checks. You see status updates the moment they change." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={hero} alt="" className="h-full w-full object-cover opacity-[0.18]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-32 md:pt-36 md:pb-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Private membership · invitation grade
            </div>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-balance text-foreground md:text-7xl">
              Sporting intelligence,<br />engineered for capital.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              PrimeStake Capital operates a closed intelligence desk and a managed-account program for members
              who treat sport as an asset class.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link to="/signup" className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-transform hover:-translate-y-0.5">
                Open an account <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link to="/pricing" className="inline-flex h-12 items-center rounded-full border border-border px-6 text-sm font-medium text-foreground hover:bg-accent">
                See packages
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.k} className="bg-card p-8">
              <p className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{s.v}</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{s.k}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT PREVIEW */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">The platform</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Your capital, in one elegant interface.</h2>
            <p className="mt-4 text-muted-foreground">A live dashboard, a concierge chat, and every release tracked in real time — built to feel as deliberate as the strategy behind it.</p>
          </div>

          <div className="mt-16 grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="group relative"
            >
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-accent/20 via-primary/10 to-transparent blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
                <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                  <span className="ml-3 text-xs text-muted-foreground">dashboard.pscapital.online</span>
                </div>
                <img
                  src={dashboardPreview}
                  alt="PrimeStake Capital portfolio dashboard"
                  className="block w-full transition-transform duration-700 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
                <div className="rounded-xl border border-border bg-card px-3 py-3"><p className="font-semibold text-foreground">Live P&L</p><p className="mt-1 text-muted-foreground">refreshed every tick</p></div>
                <div className="rounded-xl border border-border bg-card px-3 py-3"><p className="font-semibold text-foreground">Position log</p><p className="mt-1 text-muted-foreground">analyst-signed</p></div>
                <div className="rounded-xl border border-border bg-card px-3 py-3"><p className="font-semibold text-foreground">One-click withdraw</p><p className="mt-1 text-muted-foreground">24h release</p></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}
              className="relative mx-auto w-full max-w-sm"
            >
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-b from-accent/20 to-transparent blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-[var(--shadow-elegant)]">
                <img
                  src={chatPreview}
                  alt="PrimeStake Capital concierge chat"
                  className="block w-full"
                  loading="lazy"
                />
              </div>
              <div className="mt-6 rounded-2xl border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Concierge chat</p>
                <p className="mt-2 text-sm text-foreground">Direct line to a senior associate. Median response under 9 minutes.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Packages</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">A release for every conviction level.</h2>
          </div>
          <Link to="/pricing" className="text-sm font-medium underline underline-offset-4">View all pricing →</Link>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { name: "Single Correct Score", price: 50, tag: "Entry tier", features: ["1 correct score", "Analyst notes", "Result tracking"] },
            { name: "Combo Correct Score", price: 70, tag: "Most popular", features: ["2 correct scores", "Combined odds boost", "Analyst notes"], featured: true },
            { name: "Premium Package", price: 90, tag: "Flagship", features: ["3 correct scores in a row", "Priority release", "Analyst access"] },
          ].map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-3xl border p-8 ${p.featured ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`}
            >
              <p className={`text-xs uppercase tracking-wider ${p.featured ? "text-background/60" : "text-muted-foreground"}`}>{p.tag}</p>
              <h3 className="mt-3 text-2xl font-semibold">{p.name}</h3>
              <p className="mt-4 text-5xl font-semibold tracking-tight">
                ${p.price}<span className={`text-base font-medium ${p.featured ? "text-background/60" : "text-muted-foreground"}`}>/release</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{f}</li>
                ))}
              </ul>
              <Link
                to="/pricing"
                className={`mt-8 inline-flex h-11 items-center justify-center rounded-full text-sm font-medium ${
                  p.featured ? "bg-background text-foreground" : "border border-foreground text-foreground hover:bg-foreground hover:text-background"
                }`}
              >Purchase</Link>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative border-y border-border">
        <img src={marble} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" loading="lazy" />
        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Why PrimeStake</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight">An infrastructure built for discipline, not adrenaline.</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
                <f.icon className="h-5 w-5 text-foreground" />
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Members</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight">Built on the trust of a closed circle.</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-3xl border border-border bg-card p-8">
              <blockquote className="text-base leading-relaxed text-foreground">"{t.quote}"</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <img src={t.img} alt={t.name} className="h-12 w-12 rounded-full object-cover" loading="lazy" />
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-24">
          <h2 className="text-4xl font-semibold tracking-tight">Questions, answered.</h2>
          <div className="mt-12 divide-y divide-border">
            {faqs.map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="flex cursor-pointer items-center justify-between text-base font-medium">
                  {f.q}
                  <span className="ml-4 text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-3xl bg-foreground p-12 text-background md:p-20">
          <h2 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">Capital deserves discipline. Open an account today.</h2>
          <p className="mt-4 max-w-xl text-base text-background/70">Sign up in two minutes. Fund in your local currency. Start with a single release or move directly to managed accounts.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup" className="inline-flex h-12 items-center rounded-full bg-background px-6 text-sm font-medium text-foreground">Open account</Link>
            <Link to="/contact" className="inline-flex h-12 items-center rounded-full border border-background/30 px-6 text-sm font-medium text-background">Talk to us</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
