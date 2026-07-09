import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const schema = z.object({
  title: z.string().trim().min(8, "Title must be at least 8 characters").max(100),
  description: z.string().trim().min(20, "Describe your gig in at least 20 characters").max(2000),
  price: z.number().min(1, "Price must be at least $1").max(10000),
  category: z.string().min(1, "Pick a category"),
  delivery_days: z.number().int().min(1).max(30),
  skills: z.string().max(200).optional(),
  image_url: z.string().url().or(z.literal("")).optional(),
});

const CATEGORIES = ["Tutoring", "Design", "Coding", "Writing", "Photography", "Errands", "Music", "Video"];

export default function NewGig() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 25,
    category: "Tutoring",
    delivery_days: 3,
    skills: "",
    image_url: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { data, error } = await supabase
      .from("gigs")
      .insert({
        seller_id: user.id,
        title: parsed.data.title,
        description: parsed.data.description,
        price: parsed.data.price,
        category: parsed.data.category,
        delivery_days: parsed.data.delivery_days,
        skills: parsed.data.skills
          ? parsed.data.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        image_url: parsed.data.image_url || null,
        status: "OPEN",
      })
      .select("id")
      .single();
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Gig published!");
    navigate(`/gigs/${data.id as string}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">Post a gig</h1>
          <p className="text-sm text-muted-foreground">Tell the campus what you can do.</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="I will tutor you in calculus 201"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            maxLength={100}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            placeholder="What you'll deliver, your experience, what the buyer needs to send you…"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            maxLength={2000}
            rows={6}
            required
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price" type="number" min={1} max={10000}
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="days">Delivery (days)</Label>
            <Input
              id="days" type="number" min={1} max={30}
              value={form.delivery_days}
              onChange={(e) => setForm((f) => ({ ...f, delivery_days: Number(e.target.value) }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input
              id="skills"
              placeholder="calculus, math, algebra"
              value={form.skills}
              onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
              maxLength={200}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="img">Cover image URL (optional)</Label>
          <Input
            id="img" type="url"
            placeholder="https://…"
            value={form.image_url}
            onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
            maxLength={500}
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Publishing…" : "Publish gig"}
        </Button>
      </form>
    </div>
  );
}