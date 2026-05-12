import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet as WalletIcon, ShieldCheck, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";

export const Route = createFileRoute("/_app/wallet")({
  component: WalletPage,
});

interface Tx {
  id: string;
  gig_id: string;
  buyer_id: string;
  seller_id: string;
  escrow_amount: number;
  status: string;
  created_at: string;
}

function WalletPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("balance, wallet_address")
        .eq("id", user.id)
        .maybeSingle();
      setBalance(Number(p?.balance ?? 0));
      setWalletAddress((p?.wallet_address as string | null) ?? null);

      const { data: t } = await supabase
        .from("transactions")
        .select("*")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(20);
      setTxs((t as Tx[]) ?? []);
    })();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold md:text-4xl">Wallet</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track earnings and link an EVM wallet to receive on-chain payouts.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="overflow-hidden rounded-2xl bg-[var(--gradient-hero)] p-6 text-primary-foreground shadow-[var(--shadow-card)] md:col-span-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary-foreground/80">
            <WalletIcon className="h-4 w-4" /> Available balance
          </div>
          <p className="mt-3 text-5xl font-extrabold">${balance.toFixed(2)}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ConnectWalletModal walletAddress={walletAddress} onConnected={setWalletAddress} />
            <button className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/15">
              <ArrowDownToLine className="h-4 w-4" /> Withdraw
            </button>
          </div>
          {walletAddress && (
            <p className="mt-4 break-all font-mono text-xs text-primary-foreground/85">{walletAddress}</p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Escrow protection
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            All hires lock funds in escrow until both sides confirm delivery — including via the
            on-chain <code>CampusGigEscrow</code> contract once you connect a wallet.
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold">Recent transactions</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
          {txs.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No transactions yet.</div>
          ) : (
            <ul className="divide-y divide-border">
              {txs.map((t) => {
                const incoming = t.seller_id === user?.id;
                return (
                  <li key={t.id} className="flex items-center gap-3 px-5 py-4">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        incoming ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {incoming ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {incoming ? "Earned from gig" : "Paid for gig"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.created_at).toLocaleString()} · {t.status}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-extrabold ${incoming ? "text-success" : "text-foreground"}`}
                    >
                      {incoming ? "+" : "−"}${Number(t.escrow_amount).toFixed(2)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
