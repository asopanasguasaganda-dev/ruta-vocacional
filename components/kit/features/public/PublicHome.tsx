import Link from 'next/link';
import { UserRound, Compass, Map, Check, FileText, ListChecks, Compass as CompassIcon } from 'lucide-react';
import { Resources } from '../student/Resources';
import type { Navigate } from '../../types';
import { PublicHeader } from '../../components/layout/Shells';
import { Brand } from '../../components/layout/Brand';
import { useSession } from '../../lib/session';
import { useHomeMotion } from './HomeInteractions';

import {StudyExplorer} from './StudyExplorer';
import {ShineBorder} from './ShineBorder';
import './home-upgrade.css';
import './aurora-home.css';
import { HeroSection } from './HeroSection';
import { VocationalToolsSection } from './VocationalToolsSection';

const steps = [
  { icon: UserRound, title: 'Conoce tus intereses', text: 'Reconoce las actividades que disfrutas y lo que es importante para ti.' },
  { icon: Compass, title: 'Explora tus opciones', text: 'Acércate a las carreras y descubre qué se aprende y cómo se trabaja.' },
  { icon: Map, title: 'Construye tu plan', text: 'Convierte tus preguntas en próximos pasos que puedas llevar a la práctica.' },
];
export function PublicHome({ navigate }: { navigate: Navigate }) {
  const session = useSession();
  const motionRoot = useHomeMotion();
  const student = session.user?.role === 'student';
  return <div className="site-page site-home" id="inicio" ref={motionRoot}>
    <PublicHeader navigate={navigate} />
    <main id="contenido">
      <HeroSection />
      <section id="como-funciona" className="site-steps site-container" aria-label="Cómo funciona tu ruta" data-reveal>{steps.map((step, i) => <article key={step.title}><span className="site-step-number">0{i + 1}</span><div><h2>{step.title}</h2><p>{step.text}</p></div></article>)}</section>
      <VocationalToolsSection student={student} />
      <StudyExplorer/>
      <section className="home-report" id="tu-informe"><div className="site-container home-report-grid"><div className="home-report-copy" data-reveal><p className="site-eyebrow">DA SENTIDO A LO QUE DESCUBRES</p><h2>Más que un resultado.<br/>Un punto de partida.</h2><p>Conecta lo que te interesa con preguntas concretas sobre tu futuro. El informe reúne tus respuestas para ayudarte a explorar opciones con más contexto.</p><ul className="home-report-list"><li><ListChecks size={21}/><div><strong>Comprende tus respuestas</strong><p>Intereses y preferencias explicados con claridad.</p></div></li><li><CompassIcon size={21}/><div><strong>Compara posibilidades</strong><p>Razones para explorar carreras y aspectos que investigar.</p></div></li><li><FileText size={21}/><div><strong>Lleva la conversación más lejos</strong><p>Un documento para revisar y conversar con personas de confianza.</p></div></li></ul></div><div className="home-report-preview" data-reveal><ShineBorder/><div className="home-report-sheet"><header><img src="/media/brain-book-icon.png" alt="" width={32} height={32}/><div><strong>Ruta Vocacional 360°</strong><small>ORIENTACIÓN UNIVERSITARIA</small></div></header><h3>Una mirada a tu ruta</h3><p>Así se organiza la información de tu informe.</p>{[['01','Lo que te interesa','Tus respuestas, puestas en contexto'],['02','Opciones para explorar','Carreras y preguntas para comparar'],['03','Tus próximos pasos','Ideas para investigar y decidir']].map(([n,title,text])=><div className="home-report-row" key={n}><span>{n}</span><div><strong>{title}</strong><small>{text}</small></div></div>)}</div><p><FileText size={14}/>Estructura ilustrativa · No es un resultado personal</p></div></div></section>
      <section id="instituciones" className="site-institutions"><div className="site-container site-institution-grid" data-reveal><div><p className="site-eyebrow">PARA INSTITUCIONES</p><h2>Una mirada más cercana a cada estudiante.</h2><p>La orientación necesita información y acompañamiento. Un espacio organizado ayuda a comprender el proceso y conversar sobre los siguientes pasos.</p></div><div className="site-institution-features">{[
        ['Evaluaciones organizadas', 'Herramientas y cuestionarios en un mismo espacio.'],
        ['Seguimiento de cada ruta', 'Respuestas y resultados para acompañar la exploración.'],
        ['Decisiones con contexto', 'Recursos y reflexiones que enriquecen la conversación.'],
      ].map(([title, text]) => <div key={title}><Check size={20} /><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></div></section>
      
      <section id="preguntas-frecuentes" className="site-faq site-container"><div data-reveal><p className="site-eyebrow">RESOLVEMOS TUS DUDAS</p><h2>Antes de dar<br />el siguiente paso.</h2><p>Elegir también es aprender a hacer preguntas.</p></div><div className="site-faq-items" data-reveal>{[
        ['¿El test me dirá qué carrera debo estudiar?', 'Los resultados ayudan a reconocer intereses y abrir posibilidades. Tu elección se construye con información sobre las carreras, experiencias y acompañamiento.'],
        ['¿Necesito tener una carrera elegida?', 'No. Puedes explorar distintas posibilidades y comparar lo que vas descubriendo, aunque todavía no tengas una opción en mente.'],
        ['¿Puedo continuar otro día?', 'Puedes avanzar por etapas. El guardado y la consulta desde otros dispositivos requieren una cuenta y el servicio de almacenamiento habilitado.'],
        ['¿A quién está dirigida esta ruta?', 'Exclusivamente a personas de 18 años o más que desean ingresar a la universidad y todavía están explorando qué carrera elegir.'],
      ].map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
    </main><PublicFooter />
  </div>;
}

export function PublicFooter() {
  return <footer className="site-footer"><div className="site-container">
    <div className="site-footer-main"><div className="site-footer-identity"><Link href="/" aria-label="Ruta Vocacional 360°, inicio"><Brand inverse /></Link><p>Un espacio para conocerte, explorar tus posibilidades y construir tu camino académico y profesional.</p><span>Tu decisión. Tu ritmo. Tu camino.</span></div>
      <nav aria-label="Explora el sitio"><h2>Explora</h2><a href="/#como-funciona">Cómo funciona</a><a href="/#estudiantes">Herramientas</a><a href="/#areas">Áreas de estudio</a><a href="/#instituciones">Para instituciones</a></nav>
      <nav aria-label="Recursos y acceso"><h2>Enlaces útiles</h2><a href="/#preguntas-frecuentes">Preguntas frecuentes</a><Link href="/ingresar">Ingresar a mi cuenta</Link><Link href="/recuperar">Recuperar acceso</Link></nav>
    </div>
    <div className="site-footer-bottom"><p>© {new Date().getFullYear()} Ruta Vocacional 360°. Orientación académica y profesional.</p><a href="/#inicio">Volver arriba ↑</a></div>
  </div></footer>;
}

export function PublicResources({ navigate }: { navigate: Navigate }) {
  return <div className="site-page" id="inicio"><PublicHeader navigate={navigate} /><main id="contenido" className="site-container site-library"><Resources /></main><PublicFooter /></div>;
}
