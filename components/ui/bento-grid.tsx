import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import "./bento-grid.css";

export function BentoGrid({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rv-bento-grid", className)} {...props} />;
}
export function BentoCard({ title, description, icon: Icon, visual, href, action, featured = false }: {
  title: string; description: string; icon: LucideIcon; visual: ReactNode; href: string; action: string; featured?: boolean;
}) {
  return <article className={cn("rv-bento-card", featured && "rv-bento-featured")}>
    <div className="rv-bento-visual" aria-hidden="true">{visual}</div>
    <div className="rv-bento-copy"><span className="rv-bento-icon"><Icon size={22} aria-hidden="true" /></span><h3>{title}</h3><p>{description}</p>
      <Link className="rv-bento-action" href={href}>{action}<ArrowUpRight size={18} aria-hidden="true" /></Link>
    </div>
  </article>;
}
