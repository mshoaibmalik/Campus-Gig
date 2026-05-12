import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Users, Package, Receipt, Trash2, Crown, ShieldOff, AlertTriangle, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useIsAdmin } from "@/lib/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin")({
  component: AdminPage,
});

interface ProfileRow {
  id: string;
  full_name: string | null;
  university_email: string;
  department: string | null;
  balance: number;
  created_at: string;
}
interface GigRow {
  id: string;
  title: string;
  category: string;
  price: number;
  status: string;
  seller_id: string;
  created_at: string;
}
interface TxRow {
  id: string;
  gig_id: string;
  buyer_id: string;
  seller_id: string;
  escrow_amount: number;
  status: string;
  created_at: string;
}

type Tab = "overview" | "users" | "gigs" | "tx";

function AdminPage() {
  const { user } = useAuth();
  const { isAdmin, loading } = useIsAdmin();
  const [claiming, setClaiming] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  // Bootstrap: if no admin exists yet, allow current user to claim it.
  const claim = async () => {
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_admin_if_none");
    setClaiming(false);
    if (error) return toast.error(error.message);
    if (data === true) {
      toast.success("You are now an admin. Reloading…");
      setTimeout(() => window.location.reload(), 600);
    } else {
      toast.error("An admin already exists. Ask them to grant you access.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Sparkles className="h-6 w-6 animate-pulse text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user?.email}</span>.
            If no admin exists yet, you can claim the role to bootstrap the platform.
          </p>
          <Button onClick={claim} disabled={claiming} className="mt-6 gap-2">
            <Crown className="h-4 w-4" /> {claiming ? "Checking…" : "Claim admin (bootstrap)"}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3" /> Only works if no admin exists yet.
          </p>
          <div className="mt-6">
            <Link to="/dashboard" className="text-sm font-semibold text-primary hover:underline">
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Shield },
    { id: "users", label: "Users", icon: Users },
    { id: "gigs", label: "Gigs", icon: Package },
    { id: "tx", label: "Transactions", icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Shield className="h-3.5 w-3.5" /> Admin console
        </div>
        <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">Platform control</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage users, gigs and transactions across CampusGig.
        </p>
      </motion.div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview />}
      {tab === "users" && <UsersTab />}
      {tab === "gigs" && <GigsTab />}
      {tab === "tx" && <TxTab />}
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState<{ users: number; gigs: number; openGigs: number; tx: number; volume: number } | null>(null);

  useEffect(() => {
    (async () => {
      const [u, g, og, t] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("gigs").select("*", { count: "exact", head: true }),
        supabase.from("gigs").select("*", { count: "exact", head: true }).eq("status", "OPEN"),
        supabase.from("transactions").select("escrow_amount"),
      ]);
      const volume = (t.data ?? []).reduce((s, r) => s + Number(r.escrow_amount || 0), 0);
      setStats({
        users: u.count ?? 0,
        gigs: g.count ?? 0,
        openGigs: og.count ?? 0,
        tx: (t.data ?? []).length,
        volume,
      });
    })();
  }, []);

  const items = [
    { label: "Users", value: stats?.users ?? "—", icon: Users },
    { label: "Total gigs", value: stats?.gigs ?? "—", icon: Package },
    { label: "Open gigs", value: stats?.openGigs ?? "—", icon: Sparkles },
    { label: "Transactions", value: stats?.tx ?? "—", icon: Receipt },
    { label: "Escrow volume", value: stats ? `$${stats.volume.toFixed(2)}` : "—", icon: Crown },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((it, i) => (
        <motion.div
          key={it.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <it.icon className="h-4 w-4" />
            </span>
            {it.label}
          </div>
          <p className="mt-3 text-2xl font-extrabold">{it.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

function UsersTab() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ProfileRow[] | null>(null);
  const [admins, setAdmins] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");

  const load = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, university_email, department, balance, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("role", "admin");
    setRows((profiles ?? []) as ProfileRow[]);
    setAdmins(new Set((roles ?? []).map((r) => r.user_id as string)));
  };

  useEffect(() => { load(); }, []);

  const promote = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) return toast.error(error.message);
    toast.success("Granted admin");
    load();
  };
  const demote = async (userId: string) => {
    if (userId === user?.id) return toast.error("You cannot remove your own admin role.");
    const { error } = await supabase
      .from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    if (error) return toast.error(error.message);
    toast.success("Revoked admin");
    load();
  };

  const filtered = (rows ?? []).filter((r) => {
    const t = q.trim().toLowerCase();
    if (!t) return true;
    return (
      r.university_email.toLowerCase().includes(t) ||
      (r.full_name ?? "").toLowerCase().includes(t) ||
      (r.department ?? "").toLowerCase().includes(t)
    );
  });

  return (
    <div className="space-y-4">
      <Input placeholder="Search users by name, email or department…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows === null ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No users.</td></tr>
              ) : filtered.map((r) => {
                const isAdmin = admins.has(r.id);
                return (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.full_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.university_email}</div>
                    </td>
                    <td className="px-4 py-3">{r.department ?? "—"}</td>
                    <td className="px-4 py-3">${Number(r.balance ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                          <Crown className="h-3 w-3" /> Admin
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Student</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin ? (
                        <Button size="sm" variant="ghost" onClick={() => demote(r.id)} className="gap-1">
                          <ShieldOff className="h-4 w-4" /> Revoke
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => promote(r.id)} className="gap-1">
                          <Crown className="h-4 w-4" /> Make admin
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function GigsTab() {
  const [rows, setRows] = useState<GigRow[] | null>(null);
  const [q, setQ] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("gigs")
      .select("id, title, category, price, status, seller_id, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    setRows((data ?? []) as GigRow[]);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this gig permanently?")) return;
    const { error } = await supabase.from("gigs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Gig deleted");
    setRows((rs) => rs?.filter((r) => r.id !== id) ?? null);
  };

  const filtered = (rows ?? []).filter((r) =>
    !q.trim() || r.title.toLowerCase().includes(q.toLowerCase()) || r.category.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input placeholder="Search gigs…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows === null ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No gigs.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">
                    <Link to="/gigs/$gigId" params={{ gigId: r.id }} className="hover:text-primary">
                      {r.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{r.category}</td>
                  <td className="px-4 py-3">${Number(r.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => remove(r.id)} className="gap-1 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TxTab() {
  const [rows, setRows] = useState<TxRow[] | null>(null);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("transactions")
        .select("id, gig_id, buyer_id, seller_id, escrow_amount, status, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      setRows((data ?? []) as TxRow[]);
    })();
  }, []);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Gig</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows === null ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No transactions yet.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs">{r.id.slice(0, 8)}…</td>
                <td className="px-4 py-3">
                  <Link to="/gigs/$gigId" params={{ gigId: r.gig_id }} className="font-mono text-xs hover:text-primary">
                    {r.gig_id.slice(0, 8)}…
                  </Link>
                </td>
                <td className="px-4 py-3 font-semibold">${Number(r.escrow_amount).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
