import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Star, Clock } from "lucide-react";

export interface GigCardProps {
  id: string;
  title: string;
  category: string;
  price: number;
  image_url?: string | null;
  delivery_days: number;
  seller?: { full_name?: string | null; avatar_url?: string | null } | null;
}

export function GigCard(g: GigCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
    >
      <Link
        to="/gigs/$gigId"
        params={{ gigId: g.id }}
        className="group block overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {g.image_url ? (
            <img
              src={g.image_url}
              alt={g.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--gradient-hero)] text-primary-foreground">
              <span className="text-2xl font-bold opacity-90">{g.title.slice(0, 2).toUpperCase()}</span>
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-0.5 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur">
            {g.category}
          </span>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold">
              {g.seller?.avatar_url ? (
                <img src={g.seller.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                (g.seller?.full_name?.[0] ?? "?").toUpperCase()
              )}
            </div>
            <span className="truncate text-xs font-medium text-muted-foreground">
              {g.seller?.full_name ?? "Student seller"}
            </span>
          </div>
          <h3 className="line-clamp-2 min-h-[2.6rem] text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
            {g.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="font-semibold text-foreground">5.0</span>
            <span>(new)</span>
            <span className="ml-auto inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {g.delivery_days}d
            </span>
          </div>
          <div className="flex items-end justify-between border-t border-border pt-3">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Starting at</span>
            <span className="text-lg font-extrabold text-foreground">${g.price}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function GigCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-video w-full animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="flex justify-between border-t border-border pt-3">
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-12 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
