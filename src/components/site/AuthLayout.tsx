import { Link } from "@tanstack/react-router";
import { Brand } from "@/components/site/Navbar";
import authSide from "@/assets/auth-side.jpg";
import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  bullets = [
    "Encrypted release cycles, analyst-signed",
    "Managed account growth with disciplined risk",
    "24/7 concierge desk — median reply 9 min",
  ],
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  bullets?: string[];
}) {
  return (
    <div className="min-h-screen w-full bg-background lg:grid lg:grid-cols-2">
      {/* Left form panel */}
      <div className="flex min-h-screen flex-col px-6 py-8 sm:px-10 lg:min-h-0 lg:py-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Brand className="h-9 w-auto" />
          </Link>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to site</Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} PrimeStake Capital. All rights reserved.
        </p>
      </div>

      {/* Right marketing panel — desktop / tablet only */}
      <aside className="relative hidden overflow-hidden lg:block">
        <img src={authSide} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/95" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-medium backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Private membership
            </div>
            <h2 className="mt-8 text-4xl font-semibold leading-tight tracking-tight">
              Manage your sporting capital like a portfolio.
            </h2>
            <p className="mt-4 max-w-md text-base text-primary-foreground/80">
              The PrimeStake desk gives you the same operational rigor we use internally — releases,
              risk controls, and a concierge that actually picks up.
            </p>
            <ul className="mt-10 space-y-4">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-accent" />
                  <span className="text-primary-foreground/90">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 backdrop-blur">
            <p className="text-sm italic text-primary-foreground/90">
              "Single most disciplined sports capital desk I've worked with. Every release feels engineered."
            </p>
            <p className="mt-3 text-xs uppercase tracking-wider text-primary-foreground/60">
              Amara O. — Member since 2023
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
