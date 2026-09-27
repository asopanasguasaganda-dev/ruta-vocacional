"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate } from "framer-motion/dom/mini";
import { cn } from "@/lib/utils";
import "./blur-fade.css";

type MarginValue = `${number}px` | `${number}%`;
type ViewMargin = MarginValue | `${MarginValue} ${MarginValue}` | `${MarginValue} ${MarginValue} ${MarginValue} ${MarginValue}`;
export interface BlurFadeProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  yOffset?: number;
  inView?: boolean;
  inViewMargin?: ViewMargin;
  blur?: number;
}

/** Progressive enhancement: the server and pre-observation states are fully visible. */
export function BlurFade({ children, className, duration = 0.42, delay = 0, yOffset = 8, inView = false, inViewMargin = "0px 0px -12px 0px", blur = 3 }: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const played = useRef(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || played.current) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = matchMedia("(max-width: 767px)");
    let animation: ReturnType<typeof animate> | undefined;
    let observer: IntersectionObserver | undefined;
    let disposed = false;
    const clear = () => {
      animation?.cancel();
      animation = undefined;
      // Only this wrapper owns these temporary animation properties.
      for (const property of ["opacity", "transform", "filter"]) element.style.removeProperty(property);
      element.dataset.revealState = "complete";
    };
    const finish = () => { played.current = true; observer?.disconnect(); clear(); };
    const start = () => {
      if (played.current || disposed) return;
      played.current = true;
      observer?.disconnect();
      if (preference.matches || duration <= 0 || element.contains(document.activeElement)) { clear(); return; }
      element.dataset.revealState = "playing";
      try {
        animation = animate(element, {
          opacity: [0.72, 1],
          transform: [`translateY(${mobile.matches ? Math.min(4, Math.max(0, yOffset)) : Math.max(0, yOffset)}px)`, "none"],
          filter: [`blur(${mobile.matches ? 0 : Math.max(0, blur)}px)`, "none"],
        }, { duration: Math.max(0, duration), delay: Math.max(0, delay), ease: [0.22, 1, 0.36, 1] });
        void animation.then(() => { if (!disposed) clear(); });
      } catch { clear(); }
    };
    const onPreference = () => { if (preference.matches) finish(); };
    element.addEventListener("focusin", finish);
    preference.addEventListener("change", onPreference);
    if (preference.matches) finish();
    else if (!inView) start();
    else if (typeof IntersectionObserver === "undefined") finish();
    else {
      try {
        observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) start(); }, { rootMargin: inViewMargin, threshold: 0 });
        observer.observe(element);
      } catch { finish(); }
    }
    return () => { disposed = true; observer?.disconnect(); clear(); element.removeEventListener("focusin", finish); preference.removeEventListener("change", onPreference); };
  }, [duration, delay, yOffset, inView, inViewMargin, blur]);
  return <div ref={ref} className={cn("rv-blur-fade", className)}>{children}</div>;
}
