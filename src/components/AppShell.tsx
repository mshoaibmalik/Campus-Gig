import { Link, useRouterState, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { Home, Search, PlusCircle, Wallet, User as UserIcon, LogOut, Sparkles, Shield, X, CreditCard, Box } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useIsAdmin } from "@/lib/use-admin";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card shadow-[var(--shadow-card)] z-30 relative">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight">
              campus<span className="text-primary">gig</span><span className="text-primary">.</span>
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {NAV.map((n) => {
            const active = path === n.to || (n.to !== "/dashboard" && path.startsWith(n.to));
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-all duration-200",
                  active 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-primary")} />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <WalletModal />
          {isAdmin && (
            <Link
              to="/admin"
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-bold transition-colors hover:border-primary w-full",
                path.startsWith("/admin") ? "border-primary text-primary" : "text-foreground"
              )}
            >
              <Shield className="h-4 w-4" /> Admin Panel
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Nav */}
        <header className="hidden md:flex h-16 items-center justify-between border-b border-border bg-background/85 px-8 backdrop-blur z-20">
          <div className="font-semibold text-lg">
            {NAV.find(n => path === n.to || (n.to !== "/dashboard" && path.startsWith(n.to)))?.label || "Dashboard"}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-muted/50 py-1 px-3 rounded-full border border-border/50">
              <div className="h-2 w-2 rounded-full bg-success"></div>
              <span className="text-xs font-bold text-muted-foreground">{user?.email}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => signOut()} aria-label="Sign out" className="rounded-full hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Mobile Top Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:hidden shadow-sm">
          <Link to="/dashboard" className="text-xl font-extrabold tracking-tight">
            campus<span className="text-primary">gig.</span>
          </Link>
          <div className="flex items-center gap-2">
            <WalletModal isMobile />
            <Button variant="ghost" size="icon" onClick={() => signOut()} aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto mx-auto w-full max-w-7xl px-4 pb-24 pt-6 md:px-8 md:pb-10 md:pt-8 relative">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur-md md:hidden pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          {NAV.map((n) => {
            const active = path === n.to || (n.to !== "/dashboard" && path.startsWith(n.to));
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-bold transition-all duration-200",
                  active ? "text-primary scale-105" : "text-muted-foreground"
                )}
              >
                {n.to === "/gigs/new" ? (
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300",
                      "bg-[var(--gradient-hero)] text-primary-foreground shadow-lg shadow-primary/30",
                      active ? "scale-110" : ""
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                ) : (
                  <Icon className={cn("h-5 w-5", active && "drop-shadow-sm")} />
                )}
                <span className={n.to === "/gigs/new" ? "text-foreground" : ""}>{n.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function WalletModal({ isMobile = false }: { isMobile?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        variant={isMobile ? "outline" : "default"} 
        size={isMobile ? "sm" : "lg"}
        className={cn("gap-2 font-bold", !isMobile && "w-full shadow-lg shadow-primary/20")}
      >
        <Wallet className="h-4 w-4" /> 
        {isMobile ? "Connect" : "Connect Wallet"}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-[50%] top-[50%] z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-card p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold tracking-tight">Connect your wallet</h2>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Connect your wallet to participate in CampusGig's on-chain escrow and reputation systems.</p>
              
              <div className="space-y-3">
                <Button variant="outline" className="w-full h-14 justify-start px-6 rounded-2xl gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all text-base font-bold">
                  <Box className="h-6 w-6 text-orange-500" /> MetaMask
                </Button>
                <Button variant="outline" className="w-full h-14 justify-start px-6 rounded-2xl gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all text-base font-bold">
                  <CreditCard className="h-6 w-6 text-indigo-500" /> WalletConnect
                </Button>
              </div>

              <div className="mt-8 text-center text-xs text-muted-foreground">
                By connecting a wallet, you agree to CampusGig's Terms of Service.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Sparkles className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }
  
  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/auth";
    return null;
  }

  // Auth Gate Middleware: Whitelist university domains
  const email = user.email || "";
  const isSmiu = /^[a-zA-Z0-9._%+-]+@smiu\.edu\.pk$/.test(email);
  
  // NOTE: For demonstration/testing purposes, if the email isn't an SMIU email, we block access.
  if (!isSmiu) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full rounded-3xl border border-destructive/20 bg-card p-8 shadow-2xl"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
            <Shield className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-3">Access Restricted</h2>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
            CampusGig is a hyperlocal marketplace exclusively for students. Your email (<strong className="text-foreground">{email}</strong>) does not match the allowed university domain (<b>@smiu.edu.pk</b>).
          </p>
          <Button size="lg" className="w-full rounded-full font-bold" variant="destructive" onClick={() => signOut()}>
            Sign Out
          </Button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
