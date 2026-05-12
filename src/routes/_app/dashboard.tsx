import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Wallet as WalletIcon, Plus, Sparkles, Pencil, Trash2 } from "lucide-react";
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
interface OwnedGigRow {
  id: string;
  title: string;
  category: string;
  price: number;
  delivery_days: number;
  status: string;
  created_at: string;
}
function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileLite | null>(null);
  const [gigs, setGigs] = useState<GigCardProps[] | null>(null);
  const [myGigs, setMyGigs] = useState<OwnedGigRow[] | null>(null);
  const [loadingMyGigs, setLoadingMyGigs] = useState(true);
  const [deletingGig, setDeletingGig] = useState<string | null>(null);

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

  useEffect(() => {
    if (!user) return;
    const loadMyGigs = async () => {
      setLoadingMyGigs(true);
      const { data } = await supabase
        .from("gigs")
        .select("id,title,category,price,delivery_days,status,created_at")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })
        .limit(12);
      setMyGigs((data ?? []) as OwnedGigRow[]);
      setLoadingMyGigs(false);
    };
    loadMyGigs();
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

      <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
        <aside className="space-y-6 rounded-3xl border border-border bg-muted p-6 shadow-[var(--shadow-card)]">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.25em] text-primary/80">Creator tools</p>
            <h2 className="text-2xl font-semibold text-foreground">My gigs</h2>
            <p className="text-sm text-muted-foreground">
              Manage every gig you posted from one central page.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total posted gigs</p>
            <p className="mt-3 text-4xl font-extrabold text-foreground">{myGigs?.length ?? 0}</p>
            <p className="mt-1 text-sm text-muted-foreground">Your active listings</p>
          </div>

          <Link to="/gigs/manage" className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90">
            Manage posted gigs
          </Link>
          <Link to="/gigs/new" className="inline-flex w-full items-center justify-center rounded-full border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted">
            Post a new gig
          </Link>
        </aside>

        <div className="space-y-8">
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
          <Link to="/gigs/" className="text-sm font-semibold text-primary hover:underline">
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
  </div>

      <section className="rounded-[2rem] border border-border bg-muted p-8 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.25em] text-primary/80">Your gigs</p>
            <h2 className="text-2xl font-semibold text-foreground">Manage your posted gigs</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Edit, update, and delete your campus gig posts from one place.
            </p>
          </div>
          <Link to="/gigs/new">
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Create gig</Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {loadingMyGigs ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-3xl border border-border bg-background p-6" />
            ))
          ) : myGigs && myGigs.length ? (
            myGigs.map((gig) => (
              <div key={gig.id} className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">{gig.category}</p>
                    <h3 className="text-xl font-semibold text-foreground">{gig.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>{gig.delivery_days} day delivery</span>
                      <span className="rounded-full border border-border bg-muted px-2 py-1">{gig.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-lg font-semibold text-foreground">${gig.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Posted</p>
                      <p className="text-sm text-foreground">{new Date(gig.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link to="/gigs/$gigId" params={{ gigId: gig.id }} className="inline-flex items-center rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground transition hover:bg-background">
                    View
                  </Link>
                  <Link to="/gigs/$gigId/edit" params={{ gigId: gig.id }} className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition hover:bg-slate-50">
                    <Pencil className="h-4 w-4" /> Edit
                  </Link>
                  <Button
                    variant="outline"
                    className="rounded-full px-4 py-2 text-sm"
                    onClick={async () => {
                      if (!window.confirm("Delete this gig? This action cannot be undone.")) return;
                      setDeletingGig(gig.id);
                      await supabase.from("gigs").delete().eq("id", gig.id).eq("seller_id", user?.id);
                      setDeletingGig(null);
                      setMyGigs((prev) => prev?.filter((item) => item.id !== gig.id) ?? null);
                    }}
                    disabled={deletingGig === gig.id}
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingGig === gig.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-border bg-background p-8 text-center text-muted-foreground">
              You haven’t posted any gigs yet. Create your first campus offer and start earning.
            </div>
          )}
        </div>
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
      <Link to="/gigs/" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
        Browse all gigs →
      </Link>
    </div>
  );
}
