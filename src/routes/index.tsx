import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, TrendingUp, Shield, Briefcase, BarChart3, Globe2, Award, Mail, Phone, MapPin } from "lucide-react";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "PrimeStake Capital Online | Smart Investing, Real Results" },
      { name: "description", content: "PrimeStake Capital Online — institutional-grade wealth management, portfolio strategy and capital growth for modern investors." },
      { property: "og:title", content: "PrimeStake Capital Online" },
      { property: "og:description", content: "Institutional-grade wealth management for modern investors." },
    ],
  }),
});

function Nav() {
  const links = [
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Strategy", href: "#strategy" },
    { label: "Insights", href: "#insights" },
    { label: "Contact", href: "#contact" },
  ];
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block w-8 h-8 rounded-md" style={{ background: "var(--gradient-gold)" }} />
          <span className="text-foreground">PrimeStake<span className="text-muted-foreground font-normal"> Capital</span></span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-muted-foreground hover:text-foreground transition-colors">{l.label}</a>
          ))}
        </nav>
        <a href="#contact" className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 transition">
          Get Started <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <img src={heroImg} alt="" width={1920} height={1280} className="absolute inset-0 w-full h-full object-cover opacity-30" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 0%, oklch(0.18 0.04 255 / 0.4) 100%)" }} />
      <div className="relative max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="text-primary-foreground">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent mb-6">
            <span className="w-8 h-px bg-accent" /> Est. 2009
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]">
            Smart capital. <br />
            <span className="italic font-light text-accent">Real returns.</span>
          </h1>
          <p className="mt-6 text-lg text-primary-foreground/70 max-w-lg">
            PrimeStake Capital Online delivers institutional-grade portfolio strategy, risk management, and growth advisory to a new generation of investors.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-medium text-primary hover:translate-y-[-1px] transition" style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold)" }}>
              Open an Account <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#services" className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-medium border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 transition">
              Explore Services
            </a>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-md">
            {[
              { v: "$4.2B", l: "Assets Managed" },
              { v: "18yrs", l: "Track Record" },
              { v: "12k+", l: "Clients" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl font-semibold text-accent">{s.v}</div>
                <div className="text-xs text-primary-foreground/60 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Section({ id, eyebrow, title, children }: { id?: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-foreground">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function About() {
  return (
    <Section id="about" eyebrow="About us" title="A modern firm with old-world discipline.">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <p className="text-lg text-muted-foreground leading-relaxed">
          Founded by a team of former portfolio managers and quantitative analysts, PrimeStake Capital combines decades of Wall Street expertise with a digital-first client experience. We believe wealth is built deliberately — through patience, conviction, and a strategy tailored to you.
        </p>
        <div className="grid grid-cols-2 gap-6">
          {[
            { icon: Award, t: "Award-winning", d: "Recognized advisory team" },
            { icon: Shield, t: "Fiduciary", d: "Your interests, always first" },
            { icon: Globe2, t: "Global reach", d: "Markets across 40+ countries" },
            { icon: BarChart3, t: "Data-driven", d: "Quant models & research" },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="p-6 rounded-lg bg-secondary">
              <Icon className="w-6 h-6 text-primary mb-3" />
              <div className="font-medium text-foreground">{t}</div>
              <div className="text-sm text-muted-foreground mt-1">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Services() {
  const items = [
    { icon: TrendingUp, t: "Portfolio Management", d: "Actively managed strategies across equities, fixed income, and alternatives." },
    { icon: Briefcase, t: "Wealth Advisory", d: "Personal financial planning aligned with your long-term goals and lifestyle." },
    { icon: Shield, t: "Risk & Hedging", d: "Sophisticated hedging frameworks to protect capital across market cycles." },
    { icon: BarChart3, t: "Quant Strategies", d: "Systematic, model-driven portfolios built on proprietary research." },
    { icon: Globe2, t: "Global Markets", d: "Access international equities, FX, and emerging-market opportunities." },
    { icon: Award, t: "Private Capital", d: "Curated venture, private equity, and real-asset opportunities." },
  ];
  return (
    <Section id="services" eyebrow="What we do" title="Services built around your capital.">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(({ icon: Icon, t, d }) => (
          <div key={t} className="group p-8 rounded-lg border border-border bg-card hover:border-accent transition-all hover:-translate-y-1" style={{ boxShadow: "var(--shadow-elegant)" }}>
            <Icon className="w-8 h-8 text-primary group-hover:text-accent transition-colors mb-4" />
            <h3 className="text-xl font-semibold text-foreground">{t}</h3>
            <p className="mt-2 text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Strategy() {
  const steps = [
    { n: "01", t: "Discover", d: "We learn your goals, risk profile, and time horizon." },
    { n: "02", t: "Design", d: "We craft a bespoke allocation built on rigorous research." },
    { n: "03", t: "Deploy", d: "Capital is invested across diversified, monitored strategies." },
    { n: "04", t: "Deliver", d: "Continuous oversight, rebalancing, and transparent reporting." },
  ];
  return (
    <section id="strategy" className="py-24 px-6" style={{ background: "var(--gradient-hero)" }}>
      <div className="max-w-7xl mx-auto text-primary-foreground">
        <div className="max-w-2xl mb-16">
          <span className="text-xs uppercase tracking-[0.2em] text-accent">Our process</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">A disciplined approach to compounding.</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((s) => (
            <div key={s.n} className="border-t border-primary-foreground/20 pt-6">
              <div className="text-accent text-sm font-mono">{s.n}</div>
              <h3 className="mt-2 text-2xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-primary-foreground/70">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Insights() {
  const posts = [
    { tag: "Markets", t: "Why dividend equities are quietly outperforming in 2026", d: "May 14, 2026" },
    { tag: "Strategy", t: "Rebalancing in a high-rate environment: a primer", d: "May 02, 2026" },
    { tag: "Research", t: "The case for private credit allocations now", d: "Apr 19, 2026" },
  ];
  return (
    <Section id="insights" eyebrow="Insights" title="Research, briefs, and market views.">
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((p) => (
          <article key={p.t} className="p-8 rounded-lg bg-secondary hover:bg-card hover:shadow-lg transition-all cursor-pointer">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">{p.tag}</span>
            <h3 className="mt-3 text-xl font-semibold text-foreground leading-snug">{p.t}</h3>
            <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
              <span>{p.d}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Contact() {
  return (
    <Section id="contact" eyebrow="Contact" title="Let's build your strategy.">
      <div className="grid md:grid-cols-2 gap-12">
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-4">
            <input className="px-4 py-3 rounded-md bg-secondary border border-border focus:border-accent outline-none text-foreground" placeholder="First name" />
            <input className="px-4 py-3 rounded-md bg-secondary border border-border focus:border-accent outline-none text-foreground" placeholder="Last name" />
          </div>
          <input type="email" className="w-full px-4 py-3 rounded-md bg-secondary border border-border focus:border-accent outline-none text-foreground" placeholder="Email address" />
          <input className="w-full px-4 py-3 rounded-md bg-secondary border border-border focus:border-accent outline-none text-foreground" placeholder="Investable assets (optional)" />
          <textarea rows={5} className="w-full px-4 py-3 rounded-md bg-secondary border border-border focus:border-accent outline-none text-foreground resize-none" placeholder="How can we help?" />
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-medium text-primary-foreground bg-primary hover:opacity-90 transition">
            Send Inquiry <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        <div className="space-y-6">
          <p className="text-lg text-muted-foreground">
            Speak with an advisor about your portfolio. Initial consultations are complimentary and confidential.
          </p>
          <div className="space-y-4">
            {[
              { icon: Mail, t: "advisors@primestakecapital.com" },
              { icon: Phone, t: "+1 (212) 555-0188" },
              { icon: MapPin, t: "230 Park Avenue, New York, NY" },
            ].map(({ icon: Icon, t }) => (
              <div key={t} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-foreground">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="inline-block w-6 h-6 rounded" style={{ background: "var(--gradient-gold)" }} />
          <span>© {new Date().getFullYear()} PrimeStake Capital Online. All rights reserved.</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground">Disclosures</a>
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
        </div>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Hero />
        <About />
        <Services />
        <Strategy />
        <Insights />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
