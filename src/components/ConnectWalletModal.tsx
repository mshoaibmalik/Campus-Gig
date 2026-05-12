import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, Check, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

export function ConnectWalletModal({
  trigger,
  walletAddress,
  onConnected,
}: {
  trigger?: React.ReactNode;
  walletAddress?: string | null;
  onConnected?: (addr: string) => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [addr, setAddr] = useState<string | null>(walletAddress ?? null);

  async function connect() {
    setBusy(true);
    try {
      const eth = (window as unknown as { ethereum?: EthereumProvider }).ethereum;
      let address: string;
      if (eth) {
        const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
        address = accounts[0];
      } else {
        // Fallback: deterministic mock address (lets users explore the wallet UI without MetaMask)
        address =
          "0x" +
          Array.from(crypto.getRandomValues(new Uint8Array(20)))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        toast.message("No browser wallet detected", {
          description: "Linked a demo address so you can explore. Install MetaMask for a real wallet.",
        });
      }
      setAddr(address);
      if (user) {
        await supabase.from("profiles").update({ wallet_address: address }).eq("id", user.id);
      }
      onConnected?.(address);
      toast.success("Wallet connected");
    } catch (e) {
      toast.error("Could not connect wallet", { description: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const short = addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <Wallet className="h-4 w-4" />
            {short ?? "Connect Wallet"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Connect your wallet
          </DialogTitle>
          <DialogDescription>
            Link an EVM wallet to receive escrow payouts from completed gigs.
          </DialogDescription>
        </DialogHeader>

        {addr ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Connected address</p>
              <p className="mt-1 break-all font-mono text-sm">{addr}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {
                  navigator.clipboard.writeText(addr);
                  toast.success("Address copied");
                }}
              >
                <Copy className="h-4 w-4" /> Copy
              </Button>
              <Button className="flex-1 gap-2" onClick={() => setOpen(false)}>
                <Check className="h-4 w-4" /> Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full justify-start gap-3"
              disabled={busy}
              onClick={connect}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-foreground/10 text-primary-foreground">
                🦊
              </span>
              {busy ? "Connecting…" : "MetaMask / Browser wallet"}
            </Button>
            <p className="text-xs text-muted-foreground">
              CampusGig uses a non-transferable reputation token (CGREP) and an escrow contract on
              an EVM-compatible chain. See <code>contracts/CampusGigEscrow.sol</code>.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
