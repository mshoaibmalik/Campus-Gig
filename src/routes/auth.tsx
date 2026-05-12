import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { UNI_EMAIL_REGEX } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Name is too short").max(80),
  email: z
    .string()
    .trim()
    .email("Invalid email")
    .max(255)
    .regex(UNI_EMAIL_REGEX, "Use your university email (.edu / .ac.xx)"),
  password: z.string().min(6, "Min 6 characters").max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [busy, setBusy] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const parsed = signupSchema.safeParse({ fullName, email, password });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: parsed.data.fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your university email to verify.");
        setMode("login");
      } else {
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[var(--gradient-hero)] p-10 text-primary-foreground md:flex">
        <div>
          <a href="/" className="text-2xl font-extrabold">campusgig.</a>
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-extrabold leading-tight">
            Your campus, your hustle.
          </h2>
          <p className="max-w-md text-primary-foreground/80">
            Post a gig in a minute, get hired by lunch. CampusGig keeps payments in escrow and
            verifies every member by university email.
          </p>
          <ul className="space-y-3 text-sm">
            {[
              "Verified by .edu / university email",
              "Escrow-protected payouts",
              "Built-in messaging & reputation",
            ].map((b) => (
              <li key={b} className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="text-xs text-primary-foreground/60">© CampusGig</div>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 md:px-16">
        <a href="/" className="mb-10 text-xl font-extrabold md:hidden">
          campus<span className="text-primary">gig.</span>
        </a>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 inline-flex rounded-full border border-border bg-muted p-1 text-sm">
            {(["signup", "login"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
                  mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
                type="button"
              >
                {m === "signup" ? "Create account" : "Sign in"}
              </button>
            ))}
          </div>

          <h1 className="text-3xl font-extrabold md:text-4xl">
            {mode === "signup" ? "Join CampusGig" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Sign up with your university email (.edu, .ac.xx)."
              : "Sign in to your CampusGig account."}
          </p>

          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="pl-9"
                    maxLength={80}
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">University email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="pl-9"
                  maxLength={255}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pwd">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pwd"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                  minLength={6}
                  maxLength={72}
                  required
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full gap-2" disabled={busy}>
              {mode === "signup" ? "Create account" : "Sign in"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
