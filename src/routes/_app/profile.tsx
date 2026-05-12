import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    department: "",
    skills: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, department, skills, bio, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setForm({
          full_name: (data.full_name as string) ?? "",
          department: (data.department as string) ?? "",
          skills: ((data.skills as string[] | null) ?? []).join(", "),
          bio: (data.bio as string) ?? "",
          avatar_url: (data.avatar_url as string) ?? "",
        });
      }
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

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center gap-4">
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
      </div>

      <form onSubmit={save} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
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
    </div>
  );
}
