"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./scroll-sections.css";

export interface StickyScrollItem {
  id: string;
  title: string;
  description: string;
  /** Non-interactive illustration. Essential information belongs in description. */
  content?: ReactNode;
}

export function findActiveStep(tops: readonly number[], readingLine: number): number {
  if (!tops.length) return -1;
  let active = 0;
  tops.forEach((top, index) => { if (top <= readingLine) active = index; });
  return active;
}

export function StickyScroll({ content, className }: { content: StickyScrollItem[]; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(content[0]?.id);
  const [fits, setFits] = useState(true);
  const activeIndex = Math.max(0, content.findIndex(item => item.id === activeId));
  const active = content[activeIndex];

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const header = document.querySelector<HTMLElement>(".site-header");
    let frame = 0;
    let visible = true;
    let lastPanelHeight = 0;
    const measure = () => {
      frame = 0;
      const top = (header?.getBoundingClientRect().height ?? 76) + 24;
      element.style.setProperty("--rv-sticky-top", `${top}px`);
      const measuredHeight = panel.current?.scrollHeight ?? 0;
      if (measuredHeight > 0) lastPanelHeight = measuredHeight;
      const panelHeight = lastPanelHeight;
      setFits(previous => {
        const next = panelHeight === 0 || panelHeight <= window.innerHeight - top - 24;
        return previous === next ? previous : next;
      });
      if (!visible) return;
      const blocks = [...element.querySelectorAll<HTMLElement>("[data-scroll-step]")];
      const index = findActiveStep(blocks.map(block => block.getBoundingClientRect().top), Math.max(top + 40, window.innerHeight * 0.4));
      const id = content[index]?.id;
      setActiveId(previous => previous === id ? previous : id);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); });
    intersection.observe(element);
    const resize = new ResizeObserver(schedule);
    resize.observe(element);
    if (header) resize.observe(header);
    if (panel.current) resize.observe(panel.current);
    const onScroll = () => { if (visible) schedule(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => { cancelAnimationFrame(frame); intersection.disconnect(); resize.disconnect(); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", schedule); };
  }, [content]);

  if (!content.length) return null;
  return <div ref={root} className={cn("rv-sticky-scroll", className)} data-fits={fits} data-single={content.length === 1} data-active-step={active?.id}>
    <div className="rv-scroll-steps">{content.map((item, index) => <article key={item.id} id={`recorrido-${item.id}`} data-scroll-step className="rv-scroll-step" data-active={item.id === active?.id}>
      {content.length > 1 && <span className="rv-scroll-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>}
      <div><h3>{item.title}</h3><p>{item.description}</p></div>
      {item.content && <div className="rv-scroll-inline" aria-hidden="true">{item.content}</div>}
    </article>)}</div>
    <div ref={panel} className="rv-scroll-panel" aria-hidden="true" data-tone={activeIndex % 3}>
      <div className="rv-scroll-panel-stack">{content.map(item => <div key={item.id} className="rv-scroll-panel-slide" data-active={item.id === active?.id}>{item.content}</div>)}</div>
      <span className="rv-scroll-caption">Vista ilustrativa del recorrido</span>
    </div>
  </div>;
}
