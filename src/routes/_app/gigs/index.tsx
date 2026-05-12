import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GigCard, GigCardSkeleton, type GigCardProps } from "@/components/GigCard";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/gigs/")({
  component: GigsList,
});

const CATEGORIES = ["All", "Tutoring", "Design", "Coding", "Writing", "Photography", "Errands", "Music", "Video"];

function GigsList() {
  const [gigs, setGigs] = useState<GigCardProps[] | null>(null);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      setGigs(null);
      let query = supabase
        .from("gigs")
        .select("id,title,category,price,image_url,delivery_days,seller_id")
        .eq("status", "OPEN")
        .order("created_at", { ascending: false })
        .limit(60);
      if (cat !== "All") query = query.eq("category", cat);
      const { data } = await query;
      const list = (data ?? []) as Array<GigCardProps & { seller_id: string }>;
      const ids = Array.from(new Set(list.map((g) => g.seller_id)));
      let map = new Map<string, { full_name: string | null; avatar_url: string | null }>();
      if (ids.length) {
        const { data: sellers } = await supabase
          .from("profiles").select("id, full_name, avatar_url").in("id", ids);
        map = new Map((sellers ?? []).map((s) => [s.id as string, s as { full_name: string | null; avatar_url: string | null }]));
      }
      setGigs(list.map((g) => ({ ...g, seller: map.get(g.seller_id) ?? null })));
    })();
  }, [cat]);

  const filtered = useMemo(() => {
    if (!gigs) return null;
    const term = q.trim().toLowerCase();
    if (!term) return gigs;
    return gigs.filter((g) => g.title.toLowerCase().includes(term) || g.category.toLowerCase().includes(term));
  }, [gigs, q]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold md:text-4xl">Explore gigs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover services from verified students across campus.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search gigs…"
          className="pl-9"
        />
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              c === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <GigCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No gigs match your filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((g) => <GigCard key={g.id} {...g} />)}
        </div>
      )}
    </div>
  );
}
