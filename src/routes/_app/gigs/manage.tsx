import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/gigs/manage")({
  component: ManageGigs,
});

interface ManagedGig {
  id: string;
  title: string;
  category: string;
  price: number;
  delivery_days: number;
  status: string;
  created_at: string;
}

function ManageGigs() {
  const { user } = useAuth();
  const [gigs, setGigs] = useState<ManagedGig[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("gigs")
        .select("id,title,category,price,delivery_days,status,created_at")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      setGigs((data ?? []) as ManagedGig[]);
    })();
  }, [user]);

  const deleteGig = async (gigId: string) => {
    if (!confirm("Delete this gig? This action cannot be undone.")) return;
    setBusyId(gigId);
    const { error } = await supabase.from("gigs").delete().eq("id", gigId).eq("seller_id", user?.id);
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setGigs((prev) => prev?.filter((gig) => gig.id !== gigId) ?? null);
    toast.success("Gig deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-primary/80">Manage gigs</p>
          <h1 className="text-3xl font-extrabold md:text-4xl">Your posted gigs</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review every gig you posted, edit its details, or remove it when it’s complete.
          </p>
        </div>
        <Link to="/gigs/new">
          <Button size="lg" className="gap-2"><Pencil className="h-4 w-4" /> New gig</Button>
        </Link>
      </div>

      {gigs === null ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      ) : !gigs.length ? (
        <div className="rounded-3xl border border-border bg-background p-8 text-center text-muted-foreground">
          You have not posted any gigs yet.
          <div className="mt-4">
            <Link to="/gigs/new" className="text-sm font-semibold text-primary hover:underline">
              Post your first gig
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {gigs.map((gig) => (
            <div key={gig.id} className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    <span>{gig.category}</span>
                    <span className="rounded-full border border-border bg-muted px-2 py-1">{gig.status}</span>
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-foreground">{gig.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{gig.delivery_days} day delivery · Posted {new Date(gig.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-start gap-3 md:items-end">
                  <p className="text-2xl font-bold">${gig.price}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link to="/gigs/$gigId" params={{ gigId: gig.id }} className="inline-flex items-center rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground transition hover:bg-background">
                      View
                    </Link>
                    <Link to="/gigs/$gigId/edit" params={{ gigId: gig.id }} className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition hover:bg-slate-50">
                      <Pencil className="h-4 w-4" /> Edit
                    </Link>
                    <Button
                      variant="outline"
                      className="rounded-full px-4 py-2 text-sm"
                      onClick={() => deleteGig(gig.id)}
                      disabled={busyId === gig.id}
                    >
                      <Trash2 className="h-4 w-4" />
                      {busyId === gig.id ? "Deleting…" : "Delete"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
