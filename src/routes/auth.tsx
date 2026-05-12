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
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-10 px-4 py-12 md:grid-cols-[1.2fr_1fr] md:px-6 lg:px-8">
        <div className="relative hidden overflow-hidden rounded-[2rem] border border-border/70 bg-[var(--gradient-hero)] p-10 text-primary-foreground shadow-[var(--shadow-card-hover)] md:flex md:flex-col md:justify-between">
          <div className="space-y-10">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-primary-foreground shadow-sm backdrop-blur-md">
                Student-first marketplace
              </span>
              <h2 className="mt-8 text-5xl font-black leading-tight">Your campus gigs, made beautiful.</h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-primary-foreground/80">
                Verified university students only. Post gigs, hire classmates, and manage escrow payments — all from one polished dashboard.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                "Verified .edu sign‑in",
                "Escrow-protected payments",
                "Trusted campus community",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/10 p-5 shadow-inner">
                  <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-white">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-semibold text-primary-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/10 p-6 text-sm text-primary-foreground/90 shadow-inner backdrop-blur-md">
            <p className="font-semibold">Looking for a quick start?</p>
            <p className="text-sm leading-7 text-primary-foreground/80">
              Use your university email and password to sign in, or create an account to join the verified campus marketplace.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-border/70 bg-card/95 p-8 shadow-[var(--shadow-card-hover)] backdrop-blur-xl">
            <div className="mb-8 space-y-3 text-center">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-primary">
                {mode === "signup" ? "Create your account" : "Welcome back"}
              </span>
              <h1 className="text-4xl font-black">
                {mode === "signup" ? "Join CampusGig" : "Sign in to your account"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {mode === "signup"
                  ? "Start posting gigs or hiring verified classmates."
                  : "Enter your university email and secure password."}
              </p>
            </div>

            <div className="mb-6 inline-flex h-12 items-center justify-center rounded-full border border-border bg-muted px-1 text-sm font-medium text-muted-foreground">
              {(["signup", "login"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-full px-5 py-2 transition-colors ${
                    mode === m
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  type="button"
                >
                  {m === "signup" ? "Create account" : "Sign in"}
                </button>
              ))}
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
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
                      className="pl-11"
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
                    className="pl-11"
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
                    className="pl-11"
                    minLength={6}
                    maxLength={72}
                    required
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full gap-2 rounded-full" disabled={busy}>
                {mode === "signup" ? "Create account" : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
