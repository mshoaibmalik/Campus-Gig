import { Link, useRouterState, Outlet } from "@tanstack/react-router";
import { Home, Search, PlusCircle, Wallet, User as UserIcon, LogOut, Sparkles, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useIsAdmin } from "@/lib/use-admin";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/gigs", label: "Explore", icon: Search },
  { to: "/gigs/new", label: "Sell", icon: PlusCircle },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

export function AppShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav (desktop) */}
      <header className="sticky top-0 z-40 hidden border-b border-border bg-background/85 backdrop-blur md:block">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight">
              campus<span className="text-primary">gig</span><span className="text-primary">.</span>
            </span>
          </Link>
          <nav className="flex flex-1 items-center gap-1">
            {NAV.map((n) => {
              const active = path === n.to || (n.to !== "/dashboard" && path.startsWith(n.to));
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold transition-colors hover:border-primary",
                  path.startsWith("/admin") ? "border-primary text-primary" : "text-foreground"
                )}
              >
                <Shield className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
            <span className="hidden text-sm text-muted-foreground lg:inline">{user?.email}</span>
            <Button variant="ghost" size="icon" onClick={() => signOut()} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile top */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:hidden">
        <Link to="/dashboard" className="text-xl font-extrabold tracking-tight">
          campus<span className="text-primary">gig.</span>
        </Link>
        <div className="flex items-center gap-1">
          {isAdmin && (
            <Link to="/admin" aria-label="Admin" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted">
              <Shield className="h-4 w-4" />
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={() => signOut()} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-4 md:px-6 md:pb-10 md:pt-8">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur md:hidden">
        {NAV.map((n) => {
          const active = path === n.to || (n.to !== "/dashboard" && path.startsWith(n.to));
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {n.to === "/gigs/new" ? (
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span>{n.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Sparkles className="h-6 w-6 animate-pulse text-primary" />
      </div>
    );
  }
  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/auth";
    return null;
  }
  return <>{children}</>;
}
