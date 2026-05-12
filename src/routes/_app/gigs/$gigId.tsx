import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Star, ShieldCheck, MessageCircle, ArrowLeft, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/gigs/$gigId")({
  component: GigDetail,
});

interface Gig {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  delivery_days: number;
  skills: string[] | null;
  status: string;
  seller_id: string;
  buyer_id: string | null;
  created_at: string;
}

interface SellerLite {
  full_name: string | null;
  avatar_url: string | null;
  department: string | null;
  bio: string | null;
}

function GigDetail() {
  const { gigId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState<Gig | null>(null);
  const [seller, setSeller] = useState<SellerLite | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: g } = await supabase.from("gigs").select("*").eq("id", gigId).maybeSingle();
      setGig(g as Gig | null);
      if (g) {
        const { data: s } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, department, bio")
          .eq("id", g.seller_id)
          .maybeSingle();
        setSeller(s as SellerLite | null);
      }
      setLoading(false);
    })();
  }, [gigId]);

  if (loading) {
    return (
      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <div className="h-72 animate-pulse rounded-2xl bg-muted" />
          <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }
  if (!gig) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">This gig no longer exists.</p>
        <Link to="/gigs" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
          Back to explore
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === gig.seller_id;
  const isBuyer = user?.id === gig.buyer_id;

  async function hire() {
    if (!user || !gig) return;
    setBusy(true);
    const { error: txErr } = await supabase.from("transactions").insert({
      gig_id: gig.id,
      buyer_id: user.id,
      seller_id: gig.seller_id,
      escrow_amount: gig.price,
      status: "HELD",
    });
    if (txErr) { toast.error(txErr.message); setBusy(false); return; }
    const { error: gErr } = await supabase
      .from("gigs")
      .update({ status: "ACTIVE", buyer_id: user.id })
      .eq("id", gig.id);
    setBusy(false);
    if (gErr) { toast.error(gErr.message); return; }
    toast.success("Gig hired — funds held in escrow.");
    setGig({ ...gig, status: "ACTIVE", buyer_id: user.id });
  }

  async function complete() {
    if (!gig) return;
    setBusy(true);
    const { error } = await supabase.from("gigs").update({ status: "COMPLETED" }).eq("id", gig.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Marked as completed");
    setGig({ ...gig, status: "COMPLETED" });
  }

  async function cancel() {
    if (!gig) return;
    setBusy(true);
    const { error } = await supabase.from("gigs").update({ status: "CANCELLED" }).eq("id", gig.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Gig cancelled");
    setGig({ ...gig, status: "CANCELLED" });
  }

  async function remove() {
    if (!gig) return;
    if (!confirm("Delete this gig?")) return;
    const { error } = await supabase.from("gigs").delete().eq("id", gig.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Gig deleted");
    navigate({ to: "/gigs" });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Link to="/gigs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to explore
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            {gig.image_url ? (
              <img src={gig.image_url} alt={gig.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-[var(--gradient-hero)] text-primary-foreground">
                <span className="text-6xl font-extrabold opacity-90">{gig.title.slice(0,2).toUpperCase()}</span>
              </div>
            )}
          </div>

          <div>
            <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold">
              {gig.category}
            </span>
            <h1 className="mt-3 text-2xl font-extrabold md:text-3xl">{gig.title}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-semibold text-foreground">5.0</span> (new)
              </span>
              <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {gig.delivery_days}-day delivery</span>
              <StatusPill status={gig.status} />
            </div>
          </div>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-bold">About this gig</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {gig.description}
            </p>
            {gig.skills && gig.skills.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {gig.skills.map((s) => (
                  <span key={s} className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Action card */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Total</span>
              <span className="text-3xl font-extrabold">${gig.price}</span>
            </div>

            {isOwner ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">This is your gig.</p>
                {gig.status === "ACTIVE" && (
                  <Button className="w-full" onClick={complete} disabled={busy}>Mark complete</Button>
                )}
                {gig.status === "OPEN" && (
                  <Button variant="outline" className="w-full" onClick={cancel} disabled={busy}>Cancel gig</Button>
                )}
                <Button variant="ghost" className="w-full gap-2 text-destructive" onClick={remove}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            ) : gig.status === "OPEN" ? (
              <Button size="lg" className="w-full" onClick={hire} disabled={busy}>
                {busy ? "Hiring…" : `Hire for $${gig.price}`}
              </Button>
            ) : isBuyer && gig.status === "ACTIVE" ? (
              <Button size="lg" className="w-full" onClick={complete} disabled={busy}>Release escrow</Button>
            ) : (
              <Button size="lg" className="w-full" disabled>Unavailable</Button>
            )}

            <Button variant="outline" className="w-full gap-2">
              <MessageCircle className="h-4 w-4" /> Message seller
            </Button>
            <p className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Payment held in escrow until you confirm delivery.
            </p>
          </div>

          {/* Seller card */}
          <div className="mt-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold">
                {seller?.avatar_url ? (
                  <img src={seller.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  (seller?.full_name?.[0] ?? "?").toUpperCase()
                )}
              </div>
              <div>
                <p className="font-semibold">{seller?.full_name ?? "Student seller"}</p>
                <p className="text-xs text-muted-foreground">{seller?.department ?? "—"}</p>
              </div>
            </div>
            {seller?.bio && <p className="mt-4 text-sm text-muted-foreground">{seller.bio}</p>}
          </div>
        </aside>
      </div>
    </motion.div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    OPEN: "bg-success/10 text-success",
    ACTIVE: "bg-warning/15 text-warning-foreground",
    COMPLETED: "bg-accent text-accent-foreground",
    CANCELLED: "bg-muted text-muted-foreground",
    DISPUTED: "bg-destructive/15 text-destructive",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}
