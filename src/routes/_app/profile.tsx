import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { GraduationCap, Wallet, Briefcase, ShoppingCart, History, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "wallet" | "gigs" | "transactions">("profile");
  const [form, setForm] = useState({
    full_name: "",
    department: "",
    skills: "",
    bio: "",
    avatar_url: "",
  });
  const [profile, setProfile] = useState<any>(null);
  const [postedGigs, setPostedGigs] = useState<any[]>([]);
  const [hiredGigs, setHiredGigs] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [topUpAmount, setTopUpAmount] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(p);
      if (p) {
        setForm({
          full_name: (p.full_name as string) ?? "",
          department: (p.department as string) ?? "",
          skills: ((p.skills as string[] | null) ?? []).join(", "),
          bio: (p.bio as string) ?? "",
          avatar_url: (p.avatar_url as string) ?? "",
        });
      }

      // Load posted gigs
      const { data: pg } = await supabase
        .from("gigs")
        .select("id, title, status, price, created_at")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setPostedGigs(pg ?? []);

      // Load hired gigs
      const { data: hg } = await supabase
        .from("gigs")
        .select("id, title, status, price, seller_id, created_at")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setHiredGigs(hg ?? []);

      // Load transactions
      const { data: tx } = await supabase
        .from("transactions")
        .select("*")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(10);
      setTransactions(tx ?? []);
    })();
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.slice(0, 80) || null,
        department: form.department.slice(0, 80) || null,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        bio: form.bio.slice(0, 1000) || null,
        avatar_url: form.avatar_url || null,
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile saved");
  }

  async function topUp() {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) return;
    setBusy(true);
    const newBalance = (profile?.balance ?? 0) + amount;
    const { error } = await supabase
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", user?.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setProfile({ ...profile, balance: newBalance });
    setTopUpAmount("");
    toast.success(`Added $${amount.toFixed(2)} to your wallet`);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-4"
      >
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-accent text-accent-foreground">
          {form.avatar_url ? (
            <img src={form.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <GraduationCap className="h-7 w-7" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">{form.full_name || "Your profile"}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </motion.div>

      <div className="mb-6 flex gap-2 border-b border-border">
        {[
          { id: "profile", label: "Profile", icon: GraduationCap },
          { id: "wallet", label: "Wallet", icon: Wallet },
          { id: "gigs", label: "My Gigs", icon: Briefcase },
          { id: "transactions", label: "History", icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <form onSubmit={save} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-bold">Edit Profile</h2>
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={form.full_name} maxLength={80}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dept">Department</Label>
              <Input id="dept" placeholder="Computer Science" value={form.department} maxLength={80}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input id="skills" placeholder="design, react, tutoring" value={form.skills} maxLength={200}
                onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))} />
              <p className="text-xs text-muted-foreground">Used to match recommended gigs to you.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input id="avatar" type="url" value={form.avatar_url} maxLength={500}
                onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={4} value={form.bio} maxLength={1000}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </motion.div>
      )}

      {activeTab === "wallet" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3 mb-6">
              <Wallet className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-bold">Wallet Balance</h2>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold">${(profile?.balance ?? 0).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Available balance</p>
            </div>
            <div className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="topup">Add funds</Label>
                <Input
                  id="topup"
                  type="number"
                  step="0.01"
                  min="0"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <Button onClick={topUp} disabled={busy || !topUpAmount} className="w-full">
                {busy ? "Adding…" : "Add to wallet"}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "gigs" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-bold mb-4">Posted Gigs</h2>
            {postedGigs.length ? (
              <div className="space-y-3">
                {postedGigs.map((gig) => (
                  <div key={gig.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium">{gig.title}</p>
                      <p className="text-sm text-muted-foreground">${gig.price} • {gig.status}</p>
                    </div>
                    <Link to="/gigs/$gigId" params={{ gigId: gig.id }}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No gigs posted yet.</p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-bold mb-4">Hired Gigs</h2>
            {hiredGigs.length ? (
              <div className="space-y-3">
                {hiredGigs.map((gig) => (
                  <div key={gig.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium">{gig.title}</p>
                      <p className="text-sm text-muted-foreground">${gig.price} • {gig.status}</p>
                    </div>
                    <Link to="/gigs/$gigId" params={{ gigId: gig.id }}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No gigs hired yet.</p>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === "transactions" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-bold mb-4">Transaction History</h2>
            {transactions.length ? (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium">Transaction #{tx.id.slice(0,8)}</p>
                      <p className="text-sm text-muted-foreground">${tx.escrow_amount} • {tx.status}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No transactions yet.</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
