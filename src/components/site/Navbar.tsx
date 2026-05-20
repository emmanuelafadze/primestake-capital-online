import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";

export function Brand({ className = "h-8 w-auto" }: { className?: string }) {
  return <img src={logo} alt="PrimeStake Capital" className={className} />;
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <Brand className="h-9 w-auto" />
          <span className="sr-only">PrimeStake Capital</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden text-sm font-medium text-foreground hover:opacity-80 md:inline">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-transform hover:-translate-y-px"
          >
            Open account
          </Link>
        </div>
      </div>
    </header>
  );
}
