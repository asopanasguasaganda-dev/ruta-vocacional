"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/aurora-background";

export function HeroSection() {
  const reduced = useReducedMotion();
  return <AuroraBackground><section className="rv-hero site-container" aria-labelledby="home-title">
    <motion.div className="rv-hero-copy" initial={false} animate={reduced ? { opacity: 1, y: 0 } : { opacity: [0.65, 1], y: [12, 0] }} transition={{ duration: 0.55 }}>
      <p className="rv-hero-eyebrow"><span aria-hidden="true" />ORIENTACIÓN UNIVERSITARIA · ECUADOR</p>
      <h1 id="home-title">Conócete. Explora.<br /><em>Elige tu camino.</em></h1>
      <p className="rv-hero-description">Descubre tus intereses, comprende tus preferencias y explora opciones de estudio para dar tu próximo paso hacia la universidad.</p>
      <div className="rv-hero-actions"><Button role="link" nativeButton={false} render={<Link href="/registro" />} className="button button--primary">Crear mi cuenta<ArrowRight size={18} aria-hidden="true" /></Button><a href="#estudiantes">Conocer las herramientas<ArrowRight size={17} aria-hidden="true" /></a></div>
      <p className="rv-hero-note"><Check size={16} aria-hidden="true" />Para personas de 18 años o más. A tu ritmo.</p>
    </motion.div>
    <motion.div className="rv-hero-photo" initial={false} animate={reduced ? { opacity: 1, y: 0 } : { opacity: [0.7, 1], y: [10, 0] }} transition={{ duration: 0.6, delay: 0.08 }}>
      <div className="rv-hero-photo-frame"><img src="/media/campus-students.webp" alt="Estudiantes explorando ideas juntos en una biblioteca" width={1100} height={733} fetchPriority="high" /></div>
      <div className="rv-hero-labels"><span><Sparkles size={18} aria-hidden="true" />Conoce tus intereses</span><span><Compass size={18} aria-hidden="true" />Explora tus opciones</span></div>
      <p>Tu próxima etapa empieza contigo.</p>
    </motion.div>
  </section></AuroraBackground>;
}
