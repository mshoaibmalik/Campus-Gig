import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/messages/$sellerId")({
  component: MessagePage,
});

interface SellerLite {
  full_name: string | null;
  avatar_url: string | null;
  department: string | null;
  university_email: string | null;
}

function MessagePage() {
  const { sellerId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<SellerLite | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, department, university_email")
        .eq("id", sellerId)
        .maybeSingle();
      setSeller(data as SellerLite | null);
      setLoading(false);
    })();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">Seller not found.</p>
        <Link to="/gigs/" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
          Back to explore
        </Link>
      </div>
    );
  }

  async function sendMessage() {
    if (!message.trim() || !seller.university_email) return;
    setBusy(true);
    // Since no messaging table, use mailto for now
    const subject = "CampusGig inquiry";
    const body = `Hi ${seller.full_name ?? "Seller"},\n\n${message}\n\nBest regards,\n${user?.email}`;
    window.location.href = `mailto:${encodeURIComponent(seller.university_email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.success("Opening email client...");
    setBusy(false);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl space-y-6">
      <Link to="/gigs/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to explore
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-muted">
            {seller.avatar_url ? (
              <img src={seller.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              (seller.full_name?.[0] ?? "?").toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-xl font-extrabold">Message {seller.full_name ?? "Seller"}</h1>
            <p className="text-sm text-muted-foreground">{seller.department ?? "Student"}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="message">Your message</Label>
            <Textarea
              id="message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'm interested in your gig. Can we discuss the details?"
              maxLength={1000}
            />
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-accent/50 p-4">
            <Mail className="mt-0.5 h-5 w-5 text-primary" />
            <div className="text-sm">
              <p className="font-medium">Email communication</p>
              <p className="text-muted-foreground">
                Your message will be sent via email to {seller.university_email}. For privacy, use your university email.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate({ to: "/gigs/" })}>
            Cancel
          </Button>
          <Button className="flex-1 gap-2" onClick={sendMessage} disabled={busy || !message.trim()}>
            <Send className="h-4 w-4" />
            {busy ? "Sending…" : "Send message"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}