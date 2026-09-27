"use client";

import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import "./aurora-background.css";

export function AuroraBackground({ children, className, showRadialGradient = true, ...props }: HTMLAttributes<HTMLDivElement> & { showRadialGradient?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);
  useEffect(() => {
    let visible = false;
    const update = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    if (ref.current) observer.observe(ref.current);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);
  return <div {...props} ref={ref} className={cn("rv-aurora", className)} data-active={active && !reduced}>
    <div className={cn("rv-aurora-decoration", showRadialGradient && "rv-aurora-mask")} aria-hidden="true"><div className="rv-aurora-light" /></div>
    <div className="rv-aurora-content">{children}</div>
  </div>;
}
