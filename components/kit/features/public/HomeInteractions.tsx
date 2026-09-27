import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowRight, Target, Gem, UserRound, Check, Clock, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Dialog } from '../../components/ui/Dialog';
import { resources, type Resource } from '../../data/resources';

/** Progressive enhancement: content stays visible if motion or JavaScript is unavailable. */
export function useHomeMotion() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches || !('IntersectionObserver' in window)) return;
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (!preference.matches) animations.push(entry.target.animate(
          [{ opacity: .35, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 550, easing: 'cubic-bezier(.2,.7,.2,1)' },
        ));
      });
    }, { threshold: .12 });
    root.current?.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    const stop = () => { if (preference.matches) { observer.disconnect(); animations.forEach(a => a.cancel()); } };
    preference.addEventListener('change', stop);
    return () => { observer.disconnect(); animations.forEach(a => a.cancel()); preference.removeEventListener('change', stop); };
  }, []);
  return root;
}

const perspectives = [
  { id: 'intereses', icon: Target, title: 'Intereses', summary: 'Lo que despierta tu curiosidad', eyebrow: 'EXPLORA LO QUE TE MUEVE', question: '¿Qué actividades te hacen perder la noción del tiempo?', text: 'Reconocer lo que disfrutas ayuda a explorar áreas de estudio con más intención.', points: ['Identifica actividades que te interesan.', 'Conecta tus preferencias con áreas de exploración.', 'Encuentra preguntas para investigar carreras.'], note: 'Cuestionario de intereses · En tu espacio personal' },
  { id: 'valores', icon: Gem, title: 'Valores', summary: 'Lo que quieres en tu próxima etapa', eyebrow: 'RECONOCE TUS PRIORIDADES', question: '¿Qué es importante para ti al pensar en tu futuro?', text: 'Tus intereses cuentan. También el entorno, las experiencias y las condiciones que valoras.', points: ['Piensa en los entornos donde te sientes a gusto.', 'Reconoce tus motivaciones y prioridades.', 'Compara opciones con tus propios criterios.'], note: 'Valores y preferencias · En tu espacio personal' },
  { id: 'autoconocimiento', icon: UserRound, title: 'Autoconocimiento', summary: 'Lo que aprendes sobre ti', eyebrow: 'DA CONTEXTO A TU ELECCIÓN', question: '¿Qué has descubierto sobre ti en tus experiencias?', text: 'Mirar tus fortalezas y lo que quieres desarrollar da contexto a tus decisiones.', points: ['Reflexiona sobre tus habilidades y experiencias.', 'Reconoce qué quieres seguir desarrollando.', 'Conversa sobre tus dudas con alguien de confianza.'], note: 'Reflexión y autoconocimiento · En tu espacio personal' },
];

export function PerspectiveExplorer() {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const item = perspectives[selected];
  function keyboard(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? (index + 1) % 3 : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? (index + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null;
    if (next !== null) { event.preventDefault(); setSelected(next); tabs.current[next]?.focus(); }
  }
  return <div className="perspective-explorer" data-reveal>
    <div className="perspective-tabs" role="tablist" aria-label="Formas de conocerte" aria-orientation="vertical">{perspectives.map((tab, index) => <button key={tab.id} ref={el => { tabs.current[index] = el; }} role="tab" id={'tab-' + tab.id} aria-selected={selected === index} aria-controls="perspective-panel" tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={event => keyboard(event, index)}><span className="perspective-tab-icon"><tab.icon size={22} /></span><span><strong>{tab.title}</strong><small>{tab.summary}</small></span><ArrowRight size={18} /></button>)}</div>
    <div className="perspective-panel" id="perspective-panel" role="tabpanel" aria-labelledby={'tab-' + item.id} tabIndex={0}>
      <div className="perspective-content" key={item.id}><span className="site-eyebrow">{item.eyebrow}</span><h3>{item.question}</h3><p>{item.text}</p><ul>{item.points.map(point => <li key={point}><Check size={17} />{point}</li>)}</ul><div className="perspective-note"><BookOpen size={17} />{item.note}</div></div>
    </div>
  </div>;
}

export function HomeReading() {
  const [active, setActive] = useState<Resource | null>(null);
  return <>
    <section className="site-reading site-container" aria-labelledby="reading-title">
      <div className="site-reading-heading" data-reveal><div><p className="site-eyebrow">IDEAS PARA TU SIGUIENTE PASO</p><h2 id="reading-title">Empieza con una buena pregunta.</h2><p>Lecturas breves y actividades que puedes poner en práctica hoy.</p></div><Link className="site-text-link" href="/recursos">Ver todos los recursos<ArrowRight size={18} /></Link></div>
      <div className="site-reading-grid" data-reveal>{resources.slice(0, 3).map((resource, index) => <article key={resource.id} className="site-reading-card"><button onClick={() => setActive(resource)} aria-label={'Leer: ' + resource.title}><div className="site-reading-image"><img src={'/assets/resource-' + (index + 1) + '.webp'} alt="" loading="lazy" width={96} height={128} /></div><div className="site-reading-copy"><span className="site-reading-time"><span>{resource.category}</span><Clock size={14} />{resource.minutes} min</span><h3>{resource.title}</h3><p>{resource.intro}</p><span className="site-reading-action">Leer recurso<ArrowRight size={18} /></span></div></button></article>)}</div>
    </section>
    <Dialog open={!!active} onClose={() => setActive(null)} title={active?.title || 'Recurso'}><div className="home-reading-dialog"><p>{active?.intro}</p><h3>Para ponerlo en práctica</h3><ol>{active?.steps.map(step => <li key={step}>{step}</li>)}</ol><Link className="site-text-link" href="/recursos">Explorar la biblioteca<ArrowRight size={18} /></Link></div></Dialog>
  </>;
}
