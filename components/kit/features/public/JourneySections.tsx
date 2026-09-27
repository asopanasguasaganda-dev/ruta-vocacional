import Link from "next/link";
import { ArrowRight, Check, Compass, FileText, ListChecks, Map, MessageCircle, NotebookPen } from "lucide-react";
import { StickyScroll, type StickyScrollItem } from "@/components/ui/sticky-scroll-reveal";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Button } from "@/components/ui/button";
import "./journey-sections.css";

const steps: StickyScrollItem[] = [
  {
    id: "responde", title: "Responde a tu ritmo",
    description: "Completa los cuestionarios de intereses, valores y autoconocimiento. Lee cada pregunta y elige la respuesta que mejor refleje cómo te ves hoy; no se trata de acertar.",
    content: <div className="rv-journey-preview"><div className="rv-preview-top"><ListChecks size={20} /><span>Un espacio para escucharte</span></div><small>CUESTIONARIO DE INTERESES</small><strong>¿Qué actividades despiertan tu curiosidad?</strong><div className="rv-answer-example">Lee la pregunta con calma.</div><div className="rv-answer-example">Piensa en tus experiencias.</div><div className="rv-answer-example"><Check size={16} />Elige lo que más se acerca a ti.</div><p>Ejemplo del formato · Sin respuestas seleccionadas</p></div>,
  },
  {
    id: "comprende", title: "Comprende tus intereses",
    description: "Revisa tus resultados para reconocer intereses y preferencias. Las explicaciones te ayudan a relacionar tus respuestas; no certifican habilidades ni determinan una única carrera.",
    content: <div className="rv-journey-preview"><div className="rv-preview-top"><Compass size={20} /><span>Da contexto a lo que descubres</span></div><small>LECTURA DE TUS RESULTADOS</small><strong>Más que una etiqueta, una perspectiva.</strong><div className="rv-context-row"><span>01</span><div><b>Reconoce tus intereses</b><p>Actividades y temas que quieres explorar.</p></div></div><div className="rv-context-row"><span>02</span><div><b>Relaciona tus preferencias</b><p>Lo que valoras al aprender y trabajar.</p></div></div><p>Estructura de una explicación · Sin puntuaciones</p></div>,
  },
  {
    id: "explora", title: "Explora opciones de estudio",
    description: "Usa tu informe como punto de partida. Compara planes de estudio, consulta la oferta académica y anota qué necesitas investigar antes de tomar una decisión.",
    content: <div className="rv-journey-preview"><div className="rv-preview-top"><Map size={20} /><span>Convierte la curiosidad en preguntas</span></div><small>TU SIGUIENTE PASO</small><strong>Compara antes de elegir.</strong>{["¿Qué se aprende en esta carrera?", "¿Cómo es el trabajo cotidiano?", "¿Dónde puedo conocer más?"] .map(text => <div className="rv-compare-question" key={text}><MessageCircle size={17} />{text}</div>)}<p>Preguntas para investigar tus opciones</p></div>,
  },
];

export function HowItWorksSection() {
  return <section id="como-funciona" className="rv-journey-section" aria-labelledby="rv-journey-title"><div className="site-container">
    <div className="rv-journey-heading"><p className="site-eyebrow">CÓMO FUNCIONA</p><h2 id="rv-journey-title">Tu siguiente paso empieza por conocerte</h2><p>Responde los cuestionarios, comprende tus intereses y explora opciones para tu futuro universitario.</p></div>
    <StickyScroll content={steps} />
  </div></section>;
}

export function ReportPresentationSection() {
  return <section id="tu-informe" className="rv-report-section" aria-labelledby="rv-report-title"><div className="site-container">
    <ContainerScroll titleComponent={<><p className="rv-report-eyebrow">TU INFORME DE ORIENTACIÓN</p><h2 id="rv-report-title">Una mirada más clara a tus opciones</h2><p>Organiza lo que descubriste y encuentra preguntas y caminos para seguir explorando.</p></>}>
      <div className="rv-report-document">
        <header><div className="rv-report-brand"><img src="/media/brain-book-icon.png" width={44} height={44} alt="" /><span>Ruta Vocacional 360°<small>ORIENTACIÓN UNIVERSITARIA</small></span></div><span className="rv-report-preview-label">Vista previa del informe</span></header>
        <div className="rv-report-document-intro"><span>CONOCERTE PARA EXPLORAR</span><h3>Tu ruta, puesta en perspectiva.</h3><p>Una estructura para comprender tus resultados y organizar lo que quieres investigar.</p></div>
        <div className="rv-report-chapters">{[
          { icon: Compass, title: "Intereses y preferencias", text: "Resultados de tus cuestionarios y explicaciones vinculadas a tus respuestas.", note: "Comprender lo que descubriste" },
          { icon: FileText, title: "Opciones de estudio para explorar", text: "Carreras para investigar, razones para compararlas e información sobre su oferta académica.", note: "Abrir posibilidades con contexto" },
          { icon: NotebookPen, title: "Próximos pasos", text: "Preguntas para contrastar opciones y acciones concretas para avanzar en tu elección.", note: "Pasar de las preguntas a la exploración" },
        ].map(({ icon: Icon, title, text, note }, index) => <article key={title}><div className="rv-report-chapter-label"><Icon size={22} aria-hidden="true" /><span>0{index + 1}</span></div><h4>{title}</h4><p>{text}</p><span className="rv-report-chapter-note">{note}</span></article>)}</div>
        <footer><Check size={17} aria-hidden="true" /><p>Estructura ilustrativa. Tu informe personal se construye con los resultados de tus evaluaciones.</p></footer>
      </div>
    </ContainerScroll>
    <div className="rv-report-action"><p>Empieza por tus respuestas.<br /><span>Tu decisión se construye paso a paso.</span></p><Button nativeButton={false} role="link" render={<Link href="/registro" />} className="button button--primary">Crear mi cuenta<ArrowRight size={18} aria-hidden="true" /></Button></div>
  </div></section>;
}
