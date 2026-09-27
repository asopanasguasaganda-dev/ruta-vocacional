import { Compass, Heart, NotebookPen, Lightbulb, Microscope, Palette, HandHeart, Check } from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";

export function VocationalToolsSection({ student }: { student: boolean }) {
  const tools = [
    { id: "intereses", title: "Intereses", icon: Compass, description: "Reconoce las actividades que despiertan tu curiosidad. Encuentra puntos de partida para explorar distintas áreas de estudio.", visual: <div className="rv-interest-map"><span className="rv-interest-center"><Compass size={38} />Tu curiosidad</span><span><Microscope size={22} />Investigar</span><span><Palette size={22} />Crear</span><span><HandHeart size={22} />Ayudar</span><span><Lightbulb size={22} />Resolver</span></div> },
    { id: "valores", title: "Valores y preferencias", icon: Heart, description: "Identifica lo que valoras y los entornos en los que te gustaría aprender y trabajar.", visual: <div className="rv-values-visual"><Heart size={28} /><span>Lo que importa para ti</span><Check size={20} /></div> },
    { id: "autoconocimiento", title: "Autoconocimiento", icon: NotebookPen, description: "Reflexiona sobre tus experiencias, fortalezas percibidas y aspectos que quieres desarrollar.", visual: <div className="rv-notebook-visual"><NotebookPen size={30} /><div><span>Mis experiencias</span><i /><i /></div></div> },
  ];
  return <section id="estudiantes" className="site-section site-container rv-tools" aria-labelledby="rv-tools-title">
    <div className="site-section-heading" data-reveal><p className="site-eyebrow">TRES PERSPECTIVAS, TU PROPIA RUTA</p><h2 id="rv-tools-title">Empieza por conocerte mejor.</h2><p>Cada herramienta aporta una mirada distinta. Descubre qué te interesa, qué valoras y cómo te ves hoy.</p></div>
    <BentoGrid>{tools.map((tool, index) => <BentoCard key={tool.id} {...tool} featured={index === 0} href={student ? `/evaluacion/${tool.id}` : "/ingresar"} action={student ? "Explorar esta herramienta" : "Ingresar para comenzar"} />)}</BentoGrid>
    <p className="site-tools-note">Tus resultados son un punto de partida para explorar, no una profesión asignada.</p>
  </section>;
}
