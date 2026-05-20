import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import marble from "@/assets/texture-marble.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — PrimeStake Capital" },
      { name: "description", content: "PrimeStake Capital is a private intelligence desk and managed-account program for members who treat sport as an asset class." },
      { property: "og:title", content: "About PrimeStake Capital" },
      { property: "og:description", content: "Our mission, our standards, and how we protect member capital." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden border-b border-border">
        <img src={marble} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="relative mx-auto max-w-5xl px-6 py-28">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">About</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-semibold tracking-tight md:text-6xl">
            A private capital desk for the sporting market.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            We were founded by a small group of traders and analysts who believed sport could be approached
            with the same rigor as any other asset class. Today, we run a closed intelligence service and a
            discretionary account program serving members across four continents.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-12 px-6 py-24 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Mission</h2>
          <p className="mt-4 text-muted-foreground">
            Replace speculation with discipline. Every release is the output of a structured analytical
            process, audited by independent reviewers and graded against historical performance before it
            ever reaches a member dashboard.
          </p>
        </div>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Standards</h2>
          <p className="mt-4 text-muted-foreground">
            All capital is segregated, all communications encrypted, and all withdrawals reviewed by a
            second-line operations team. We hold ourselves to institutional reporting standards.
          </p>
        </div>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Security</h2>
          <p className="mt-4 text-muted-foreground">
            Bank-grade transport encryption, row-level data isolation, and document storage with signed
            time-limited URLs. KYC documents are accessible only by our compliance desk.
          </p>
        </div>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Trust</h2>
          <p className="mt-4 text-muted-foreground">
            We do not advertise to retail audiences. Membership is granted on the basis of completed KYC and
            sustained engagement with the platform.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
