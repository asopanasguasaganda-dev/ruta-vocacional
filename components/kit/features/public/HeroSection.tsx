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
      <p className="rv-hero-eyebrow"><span aria-hidden="true" />BACHILLERATO Y UNIVERSIDAD · ECUADOR</p>
      <h1 id="home-title">Conócete. Explora.<br /><em>Elige tu camino.</em></h1>
      <p className="rv-hero-description">Descubre tus intereses, compara Bachillerato en Ciencias y Técnico y conecta tu perfil con opciones universitarias.</p>
      <div className="rv-hero-actions"><Button role="link" nativeButton={false} render={<Link href="/registro" />} className="button button--primary">Crear mi cuenta<ArrowRight size={18} aria-hidden="true" /></Button><a href="#estudiantes">Conocer las herramientas<ArrowRight size={17} aria-hidden="true" /></a></div>
      <p className="rv-hero-note"><Check size={16} aria-hidden="true" />Desde la elección de bachillerato hasta la universidad. A tu ritmo.</p>
    </motion.div>
    <div className="rv-hero-scene" aria-hidden="true">
      <span className="rv-scene-chip"><Sparkles size={17} />Una nueva perspectiva</span>
      <div className="rv-scene-caption"><span><Compass size={22} /></span><div><strong>Tu futuro empieza contigo.</strong><p>Conoce tus intereses. Abre posibilidades.</p></div></div>
    </div>
  </section></AuroraBackground>;
}
