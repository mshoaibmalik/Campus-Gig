import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

interface ProfileLite {
  full_name: string | null;
  balance: number;
}

export default function HirePage() {
  const { gigId } = useParams<{ gigId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState<Gig | null>(null);
  const [profile, setProfile] = useState<ProfileLite | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !gigId) return;
    (async () => {
      setLoading(true);
      const { data: g } = await supabase.from("gigs").select("*").eq("id", gigId).maybeSingle();
      setGig(g as Gig | null);
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, balance")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(p as ProfileLite | null);
      setLoading(false);
    })();
  }, [gigId, user]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!gig || gig.status !== "OPEN") {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">This gig is no longer available for hire.</p>
        <Link to="/gigs" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
          Back to explore
        </Link>
      </div>
    );
  }

  if (gig.seller_id === user?.id) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">You cannot hire your own gig.</p>
        <Link to="/gigs" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
          Back to explore
        </Link>
      </div>
    );
  }

  const insufficientFunds = (profile?.balance ?? 0) < gig.price;

  async function confirmHire() {
    if (!user || !gig || insufficientFunds) return;
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
    navigate("/dashboard");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl space-y-6">
      <Link to={`/gigs/${gigId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to gig
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-2xl font-extrabold">Confirm hire</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review the details and confirm your hire for this gig.
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-muted">
              {gig.image_url ? (
                <img src={gig.image_url} alt={gig.title} className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-bold">{gig.title.slice(0,2).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h2 className="font-semibold">{gig.title}</h2>
              <p className="text-sm text-muted-foreground">{gig.category} • {gig.delivery_days}-day delivery</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total cost</span>
              <span className="text-lg font-bold">${gig.price}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your balance</span>
              <span className={`text-sm font-medium ${insufficientFunds ? 'text-destructive' : 'text-success'}`}>
                ${profile?.balance ?? 0}
              </span>
            </div>
            {insufficientFunds && (
              <p className="mt-2 text-xs text-destructive">
                Insufficient funds. Please add more to your wallet.
              </p>
            )}
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-accent/50 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
            <div className="text-sm">
              <p className="font-medium">Secure escrow payment</p>
              <p className="text-muted-foreground">
                Your payment is held safely until you confirm delivery. If there's an issue, our team will help resolve it.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate(`/gigs/${gigId}`)}>
            Cancel
          </Button>
          <Button className="flex-1 gap-2" onClick={confirmHire} disabled={busy || insufficientFunds}>
            <CreditCard className="h-4 w-4" />
            {busy ? "Hiring…" : `Hire for $${gig.price}`}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}