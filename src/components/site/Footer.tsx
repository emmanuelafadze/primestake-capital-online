import { Link } from "@tanstack/react-router";
import { Brand } from "./Navbar";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Brand className="h-10 w-auto" />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            PrimeStake Capital is a private intelligence desk delivering vetted sporting investments and
            managed account growth for serious capital.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Platform</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Account</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/login" className="hover:text-foreground">Sign in</Link></li>
            <li><Link to="/signup" className="hover:text-foreground">Open account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} PrimeStake Capital. All rights reserved.</p>
          <p>Capital at risk. Service for adults 18+.</p>
        </div>
      </div>
    </footer>
  );
}
