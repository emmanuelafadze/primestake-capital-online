import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { Brand } from "@/components/site/Navbar";
import {
  LayoutDashboard, ShoppingBag, ListChecks, Wallet, Receipt, BarChart3,
  Bell, MessageSquare, Settings, User as UserIcon, Briefcase, LogOut,
  Users, Package, Target, ShieldCheck, FileText, Inbox, Activity, BanknoteArrowUp,
  Menu, X,
} from "lucide-react";

type Item = { to: string; label: string; icon: typeof LayoutDashboard };

const USER_NAV: Item[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/purchase", label: "Purchase Matches", icon: ShoppingBag },
  { to: "/dashboard/purchases", label: "My Purchases", icon: ListChecks },
  { to: "/dashboard/account-management", label: "Account Management", icon: Briefcase },
  { to: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { to: "/dashboard/transactions", label: "Transactions", icon: Receipt },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { to: "/dashboard/support", label: "Support", icon: MessageSquare },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
  { to: "/dashboard/profile", label: "Profile", icon: UserIcon },
];

const ADMIN_NAV: Item[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/packages", label: "Packages", icon: Package },
  { to: "/admin/matches", label: "Fixed Matches", icon: Target },
  { to: "/admin/purchases", label: "Purchases", icon: ShoppingBag },
  { to: "/admin/transactions", label: "Transactions", icon: Receipt },
  { to: "/admin/withdrawals", label: "Withdrawals", icon: BanknoteArrowUp },
  { to: "/admin/kyc", label: "KYC Review", icon: ShieldCheck },
  { to: "/admin/investments", label: "Investments", icon: Briefcase },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/support", label: "Support", icon: Inbox },
  { to: "/admin/logs", label: "Audit Log", icon: FileText },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children, mode = "user" }: { children: ReactNode; mode?: "user" | "admin" }) {
  const { user, loading, isAdmin, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  useEffect(() => {
    if (loading) return;
    if (!user) nav({ to: "/login", search: { redirect: loc.pathname } as never });
    if (mode === "admin" && user && !isAdmin) nav({ to: "/dashboard" });
  }, [user, loading, isAdmin, mode, nav, loc.pathname]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  const items = mode === "admin" ? ADMIN_NAV : USER_NAV;

  const SidebarBody = (
    <>
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <Brand className="h-8 w-auto" />
        <button onClick={() => setOpen(false)} className="md:hidden rounded p-1 text-muted-foreground hover:bg-accent" aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 text-sm">
        {items.map((it) => {
          const active = loc.pathname === it.to || (it.to !== "/dashboard" && it.to !== "/admin" && loc.pathname.startsWith(it.to));
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        {mode === "user" && isAdmin && (
          <Link to="/admin" className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
            <ShieldCheck className="h-4 w-4" /> Admin console
          </Link>
        )}
        {mode === "admin" && (
          <Link to="/dashboard" className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
            <Activity className="h-4 w-4" /> User dashboard
          </Link>
        )}
        <button onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-secondary/40">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
        <button onClick={() => setOpen(true)} className="rounded p-2 text-foreground hover:bg-accent" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <Brand className="h-7 w-auto" />
        <div className="w-9" />
      </header>

      {/* Mobile drawer + backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-sidebar shadow-2xl"
          >
            {SidebarBody}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-sidebar md:flex">
        {SidebarBody}
      </aside>

      <main className="md:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-10 md:py-10">{children}</div>
      </main>
    </div>
  );
}
