import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap, ShieldCheck, Wallet, Sparkles, ArrowRight, Search,
  Star, CheckCircle2, Users, TrendingUp, Quote, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const FEATURES = [
  { icon: GraduationCap, title: "Verified students only", body: "Sign-ups are gated by your university email — no random strangers." },
  { icon: ShieldCheck, title: "Escrow-protected payouts", body: "Funds are held safely until both sides confirm the gig is delivered." },
  { icon: Wallet, title: "On-chain reputation", body: "Every completed gig mints non-transferable rep on your profile." },
];

const CATEGORIES = [
  { name: "Tutoring", emoji: "📚", color: "from-emerald-400/20 to-emerald-500/5", text: "text-emerald-500" },
  { name: "Design", emoji: "🎨", color: "from-sky-400/20 to-sky-500/5", text: "text-sky-500" },
  { name: "Coding", emoji: "💻", color: "from-violet-400/20 to-violet-500/5", text: "text-violet-500" },
  { name: "Writing", emoji: "✍️", color: "from-amber-400/20 to-amber-500/5", text: "text-amber-500" },
  { name: "Photography", emoji: "📸", color: "from-rose-400/20 to-rose-500/5", text: "text-rose-500" },
  { name: "Errands", emoji: "🚲", color: "from-teal-400/20 to-teal-500/5", text: "text-teal-500" },
  { name: "Music", emoji: "🎧", color: "from-fuchsia-400/20 to-fuchsia-500/5", text: "text-fuchsia-500" },
  { name: "Video", emoji: "🎬", color: "from-orange-400/20 to-orange-500/5", text: "text-orange-500" },
];

const SAMPLE_GIGS = [
  { t: "I will tutor you in Calculus 201", p: 25, c: "Tutoring", g: "from-emerald-400 to-emerald-600", rating: 4.9, reviews: 132 },
  { t: "I will design a clean modern logo", p: 60, c: "Design", g: "from-sky-400 to-sky-600", rating: 5.0, reviews: 88 },
  { t: "I will polish your resume for SWE roles", p: 15, c: "Writing", g: "from-amber-400 to-amber-600", rating: 4.8, reviews: 211 },
  { t: "I will help you move out this weekend", p: 40, c: "Errands", g: "from-violet-400 to-violet-600", rating: 4.9, reviews: 47 },
];

const STEPS = [
  { n: 1, title: "Sign in with .edu", body: "Verify your university email in seconds. Completely secure and student-exclusive." },
  { n: 2, title: "Post or browse gigs", body: "List your skills to earn, or hire a talented classmate to get things done." },
  { n: 3, title: "Pay safely via escrow", body: "Funds are held securely and released only when you're 100% satisfied." },
];

const TESTIMONIALS = [
  { name: "Alia, NYU", quote: "Made $300 tutoring linear algebra last month — between lectures. The escrow feature is a lifesaver.", role: "CS Junior" },
  { name: "Marcus, UCLA", quote: "Hired a designer for my club's poster. Done in two days and it looked incredibly professional.", role: "Mech Eng" },
  { name: "Priya, MIT", quote: "Escrow gave me peace of mind on my first gig. I love knowing I'll actually get paid for my work.", role: "Math Sophomore" },
];

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) navigate("/dashboard", { replace: true });
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 text-foreground overflow-x-hidden">
      {/* Floating Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl rounded-full border border-border/50 bg-background/80 px-4 py-3 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-black/50"
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="ml-2 text-2xl font-black tracking-tighter">
            campus<span className="text-primary">gig.</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">How it works</a>
            <a href="#categories" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">Categories</a>
            <a href="#features" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">Why CampusGig</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="hidden sm:block">
              <Button variant="ghost" className="rounded-full font-bold hover:bg-primary/10 hover:text-primary">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="rounded-full font-bold shadow-lg shadow-primary/30 transition-transform hover:scale-105">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center pt-32 pb-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -left-40 top-20 -z-10 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -right-40 bottom-0 -z-10 h-[600px] w-[600px] rounded-full bg-sky-400/10 blur-[120px]" 
        />
        
        <div className="mx-auto grid max-w-7xl gap-16 px-4 md:grid-cols-[1.1fr_1fr] md:gap-8 md:px-6">
          {/* Hero Content */}
          <div className="flex flex-col justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
              className="mb-6 w-fit rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary shadow-[0_0_20px_rgba(29,191,115,0.2)] backdrop-blur-md flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" /> 
              The #1 marketplace for university students
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl font-black leading-[1.1] tracking-tight md:text-7xl"
            >
              Hire a classmate.<br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 bg-gradient-to-r from-primary via-emerald-400 to-sky-500 bg-clip-text text-transparent">
                  Earn between lectures.
                </span>
                <motion.span 
                  initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                  className="absolute bottom-1 left-0 -z-10 h-3 bg-primary/20 rounded-full" 
                />
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-lg text-lg text-muted-foreground md:text-xl leading-relaxed"
            >
              CampusGig is the hyperlocal marketplace where verified students trade skills — tutoring, design, code, and more — safely.
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex w-full max-w-xl items-center gap-3 rounded-full border border-border/50 bg-background/50 p-2 shadow-xl backdrop-blur-xl focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all"
              onSubmit={(e) => { e.preventDefault(); navigate("/auth"); }}
            >
              <Search className="ml-4 h-6 w-6 text-primary shrink-0" />
              <input
                placeholder='Try "calculus tutor" or "logo design"...'
                className="h-12 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-muted-foreground/70"
              />
              <Button size="lg" className="rounded-full px-8 font-bold shadow-lg shadow-primary/20">Search</Button>
            </motion.form>

            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }}
              className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-semibold text-muted-foreground"
            >
              <span className="flex items-center gap-2 bg-background/50 py-1.5 px-4 rounded-full border border-border/50"><CheckCircle2 className="h-5 w-5 text-primary" /> .edu verified</span>
              <span className="flex items-center gap-2 bg-background/50 py-1.5 px-4 rounded-full border border-border/50"><ShieldCheck className="h-5 w-5 text-primary" /> Escrow protected</span>
              <span className="flex items-center gap-2 bg-background/50 py-1.5 px-4 rounded-full border border-border/50"><Star className="h-5 w-5 text-warning fill-warning" /> 4.9/5 average</span>
            </motion.div>
          </div>

          {/* Hero Visuals */}
          <div className="relative hidden md:block" style={{ perspective: 1000 }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                initial={{ rotateY: -15, rotateX: 5 }}
                animate={{ rotateY: [-15, -10, -15], rotateX: [5, 8, 5] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative w-full h-[600px]"
              >
                {SAMPLE_GIGS.map((g, i) => (
                  <motion.div
                    key={g.t}
                    initial={{ opacity: 0, y: 50, x: i % 2 === 0 ? -50 : 50 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 + i * 0.1, type: "spring" }}
                    whileHover={{ scale: 1.05, zIndex: 50, y: -10 }}
                    className={`absolute w-72 overflow-hidden rounded-3xl border border-white/20 bg-background/80 shadow-2xl backdrop-blur-xl ${
                      i === 0 ? "top-10 left-0 z-30" :
                      i === 1 ? "top-32 right-0 z-20" :
                      i === 2 ? "bottom-32 left-10 z-40" :
                      "bottom-10 right-10 z-10"
                    }`}
                  >
                    <div className={`h-32 bg-gradient-to-br ${g.g} p-4 relative`}>
                      <span className="absolute top-4 left-4 rounded-full bg-white/30 px-3 py-1 text-xs font-bold text-black backdrop-blur-md mix-blend-hard-light">
                        {g.c}
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="text-base font-bold leading-tight line-clamp-2">{g.t}</p>
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-warning fill-warning" />
                        <span className="font-extrabold">{g.rating}</span>
                        <span className="text-muted-foreground">({g.reviews})</span>
                      </div>
                      <div className="mt-4 flex items-end justify-between border-t border-border/50 pt-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Starting at</span>
                        <span className="text-2xl font-black">${g.p}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            
            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2, type: "spring" }}
              className="absolute -left-10 top-1/2 -translate-y-1/2 z-50 rounded-2xl border border-white/20 bg-white/60 p-4 shadow-2xl backdrop-blur-xl dark:bg-black/60"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Student Earnings</p>
                  <p className="text-xl font-black text-foreground">$12,480+ <span className="text-sm font-medium text-muted-foreground">this week</span></p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-20 -mt-10 mb-20 px-4 md:px-6">
        <FadeIn delay={0.2} className="mx-auto max-w-6xl rounded-3xl border border-border/50 bg-card/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 divide-x divide-border/50">
            {[
              { v: "4,200+", l: "Verified Students", i: Users },
              { v: "1,150+", l: "Gigs Delivered", i: CheckCircle2 },
              { v: "$48k+", l: "Earned by Students", i: Wallet },
              { v: "120+", l: "Universities", i: GraduationCap },
            ].map((s, idx) => (
              <div key={s.l} className="flex flex-col items-center text-center px-4">
                <s.i className="h-8 w-8 text-primary/80 mb-3" />
                <p className="text-3xl font-black tracking-tight md:text-4xl">{s.v}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Categories */}
      {/* <section id="categories" className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <FadeIn className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black md:text-5xl tracking-tight">Browse by category</h2>
              <p className="mt-4 text-lg text-muted-foreground">Find a classmate who's already great at what you need. From complex calculus to stunning UI design.</p>
            </div>
            <Link to="/auth" className="group hidden md:inline-flex items-center gap-2 text-base font-bold text-primary hover:text-primary/80">
              Explore all categories <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </FadeIn>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
            {CATEGORIES.map((c, i) => (
              <FadeIn key={c.name} delay={i * 0.05}>
                <Link
                  to="/auth"
                  className="group block h-full overflow-hidden rounded-3xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${c.color} mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <span className="text-3xl drop-shadow-sm">{c.emoji}</span>
                  </div>
                  <h3 className={`text-xl font-bold ${c.text}`}>{c.name}</h3>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary">
                    View gigs <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section> */}

      {/* How it works */}
      <section id="how" className="py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-20">
            <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold tracking-wider text-primary uppercase">How It Works</span>
            <h2 className="mt-6 text-4xl font-black md:text-5xl tracking-tight">Three steps. Zero stress.</h2>
            <p className="mt-4 text-lg text-muted-foreground">We handle the verification and payments so you can focus on getting things done.</p>
          </FadeIn>
          
          <div className="relative grid gap-12 md:grid-cols-3 md:gap-8">
            <div className="absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent hidden md:block" />
            
            {STEPS.map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.2} className="relative z-10 text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-background border-4 border-card shadow-2xl">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-600 text-3xl font-black text-white shadow-inner">
                    {s.n}
                  </div>
                </div>
                <h3 className="mt-8 text-2xl font-bold">{s.title}</h3>
                <p className="mt-4 text-base text-muted-foreground px-4 leading-relaxed">{s.body}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-slate-950 to-slate-950" />
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative z-10">
          <FadeIn className="text-center max-w-3xl mx-auto mb-20">
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold tracking-wider text-primary uppercase backdrop-blur-md">Why CampusGig</span>
            <h2 className="mt-6 text-4xl font-black md:text-5xl tracking-tight text-white">Built for absolute trust.</h2>
          </FadeIn>
          
          <div className="grid gap-8 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.15}>
                <div className="group h-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:border-primary/50">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                    <f.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-white/70 leading-relaxed">{f.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <FadeIn className="mb-16">
            <span className="text-sm font-bold uppercase tracking-wider text-primary">Loved by students</span>
            <h2 className="mt-2 text-4xl font-black md:text-5xl tracking-tight">From dorm rooms to dean's lists.</h2>
          </FadeIn>
          
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.15}>
                <div className="h-full rounded-3xl border border-border/50 bg-card p-8 shadow-lg transition-shadow hover:shadow-xl">
                  <Quote className="h-10 w-10 text-primary/20 mb-6" />
                  <p className="text-lg font-medium leading-relaxed italic text-foreground/90">"{t.quote}"</p>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-lg font-black text-white shadow-md">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-base font-bold">{t.name}</p>
                      <p className="text-sm font-semibold text-primary">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6 mb-10">
        <FadeIn>
          <div className="mx-auto max-w-6xl relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 md:p-20 shadow-2xl">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
                Ready to level up your campus life?
              </h2>
              <p className="text-xl text-white/80 mb-10 leading-relaxed">
                Join thousands of students who are already earning and learning on CampusGig. Sign up takes less than 60 seconds.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-14 px-8 rounded-full text-lg font-bold bg-primary text-white hover:bg-primary/90 shadow-[0_0_40px_rgba(29,191,115,0.4)] transition-all hover:scale-105">
                    Get Started Now
                  </Button>
                </Link>
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full h-14 px-8 rounded-full text-lg font-bold border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur-md">
                    Browse Gigs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <Link to="/" className="text-3xl font-black tracking-tighter">
              campus<span className="text-primary">gig.</span>
            </Link>
            <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-muted-foreground">
              <a href="#how" className="hover:text-primary transition-colors">How it works</a>
              <a href="#categories" className="hover:text-primary transition-colors">Categories</a>
              <a href="#features" className="hover:text-primary transition-colors">Why us</a>
              <Link to="/auth" className="hover:text-primary transition-colors">Sign in</Link>
            </div>
          </div>
          <div className="text-center text-sm font-semibold text-muted-foreground/60">
            <p>© {new Date().getFullYear()} CampusGig — for students, by students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}