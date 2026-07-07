import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Wallet as WalletIcon, Plus, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { GigCard, GigCardSkeleton, type GigCardProps } from "@/components/GigCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

interface ProfileLite {
  full_name: string | null;
  department: string | null;
  skills: string[] | null;
  balance: number;
  wallet_address: string | null;
}

function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileLite | null>(null);
  const [gigs, setGigs] = useState<GigCardProps[] | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, department, skills, balance, wallet_address")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(p as ProfileLite | null);

      // Skill-match feed: filter by department or overlapping skills, fall back to recent.
      const skills = (p?.skills as string[] | null) ?? [];
      let q = supabase
        .from("gigs")
        .select("id,title,category,price,image_url,delivery_days,seller_id")
        .eq("status", "OPEN")
        .neq("seller_id", user.id)
        .order("created_at", { ascending: false })
        .limit(12);
      if (skills.length) q = q.overlaps("skills", skills);
      const { data } = await q;

      const list = (data ?? []) as Array<GigCardProps & { seller_id: string }>;
      const sellerIds = Array.from(new Set(list.map((g) => g.seller_id)));
      let sellerMap = new Map<string, { full_name: string | null; avatar_url: string | null }>();
      if (sellerIds.length) {
        const { data: sellers } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", sellerIds);
        sellerMap = new Map((sellers ?? []).map((s) => [s.id as string, s as { full_name: string | null; avatar_url: string | null }]));
      }
      setGigs(list.map((g) => ({ ...g, seller: sellerMap.get(g.seller_id) ?? null })));
    })();
  }, [user]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-3xl font-extrabold md:text-4xl">Hey, {firstName} 👋</h1>
        </div>
        <Link to="/gigs/new">
          <Button size="lg" className="gap-2"><Plus className="h-4 w-4" /> Post a gig</Button>
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<WalletIcon className="h-5 w-5" />}
          label="Available balance"
          value={`$${(profile?.balance ?? 0).toFixed(2)}`}
          accent
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Earnings (30d)"
          value="$0.00"
          hint="Complete your first gig to see earnings"
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          label="Your department"
          value={profile?.department ?? "—"}
          hint={profile?.department ? "Used for gig matching" : "Add it in your profile"}
        />
      </div>

      {/* Recommended gigs */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold md:text-2xl">Recommended for you</h2>
            <p className="text-sm text-muted-foreground">
              Matched to your skills{profile?.department ? ` and ${profile.department}` : ""}.
            </p>
          </div>
          <Link to="/gigs" className="text-sm font-semibold text-primary hover:underline">
            View all <ArrowRight className="-mb-0.5 inline h-4 w-4" />
          </Link>
        </div>

        {gigs === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <GigCardSkeleton key={i} />)}
          </div>
        ) : gigs.length === 0 ? (
          <EmptyFeed />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {gigs.map((g) => <GigCard key={g.id} {...g} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-border p-5 shadow-[var(--shadow-card)] ${
        accent ? "bg-[var(--gradient-hero)] text-primary-foreground" : "bg-card"
      }`}
    >
      <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${accent ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
        <span className={`flex h-7 w-7 items-center justify-center rounded-md ${accent ? "bg-primary-foreground/15" : "bg-accent text-accent-foreground"}`}>
          {icon}
        </span>
        {label}
      </div>
      <p className="mt-3 text-3xl font-extrabold">{value}</p>
      {hint && <p className={`mt-1 text-xs ${accent ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{hint}</p>}
    </div>
  );
}

function EmptyFeed() {
  return (
    <div className="rounded-2xl border border-dashed border-border p-12 text-center">
      <p className="text-sm text-muted-foreground">No matching gigs yet.</p>
      <Link to="/gigs" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
        Browse all gigs →
      </Link>
    </div>
  );
}
