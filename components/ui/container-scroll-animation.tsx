"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import "./scroll-sections.css";

export function ContainerScroll({ titleComponent, children, className }: { titleComponent: ReactNode; children: ReactNode; className?: string }) {
  const target = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target, offset: ["start 90%", "start 28%"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [10, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.98, 1]);
  return <div className={cn("rv-container-scroll", className)}>
    <div className="rv-container-heading">{titleComponent}</div>
    <div ref={target} className="rv-container-stage"><motion.div className="rv-container-card" style={{ rotateX, scale }}>{children}</motion.div></div>
  </div>;
}
