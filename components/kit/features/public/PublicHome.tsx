import Link from 'next/link';
import { ArrowRight, UserRound, Compass, Map, GraduationCap, Check, MapPin, FileText, ListChecks, Compass as CompassIcon } from 'lucide-react';
import { Resources } from '../student/Resources';
import type { Navigate } from '../../types';
import { PublicHeader } from '../../components/layout/Shells';
import { Brand } from '../../components/layout/Brand';
import { useSession } from '../../lib/session';
import { HomeReading, PerspectiveExplorer, useHomeMotion } from './HomeInteractions';

import {StudyExplorer} from './StudyExplorer';
import {ShineBorder} from './ShineBorder';
import './home-upgrade.css';

const steps = [
  { icon: UserRound, title: 'Conoce tus intereses', text: 'Reconoce las actividades que disfrutas y lo que es importante para ti.' },
  { icon: Compass, title: 'Explora tus opciones', text: 'Acércate a las carreras y descubre qué se aprende y cómo se trabaja.' },
  { icon: Map, title: 'Construye tu plan', text: 'Convierte tus preguntas en próximos pasos que puedas llevar a la práctica.' },
];
export function PublicHome({ navigate }: { navigate: Navigate }) {
  const session = useSession();
  const motionRoot = useHomeMotion();
  const student = session.user?.role === 'student';
  return <div className="site-page" id="inicio" ref={motionRoot}>
    <PublicHeader navigate={navigate} />
    <main id="contenido">
      <div className="site-hero-surface"><section className="site-hero site-container" aria-labelledby="home-title">
        <div className="site-hero-copy" data-reveal><p className="site-eyebrow home-kicker"><i aria-hidden="true"/>ORIENTACIÓN UNIVERSITARIA · ECUADOR</p>
          <h1 id="home-title">Conócete.<br /><em>Explora.</em><br />Elige tu camino.</h1>
          <p>Tu futuro no se decide en un día. Descubre tus intereses, conoce tus opciones y encuentra una dirección propia.</p>
          <div className="site-hero-actions"><Link className="button button--primary" href={student ? '/mi-ruta' : '/registro'}>{student ? 'Ir a mi ruta' : 'Crear mi cuenta'}<ArrowRight size={18} /></Link><a className="site-text-link" href="#como-funciona">Ver cómo funciona<ArrowRight size={16} /></a></div>
          <span className="site-hero-note"><Check size={15}/>Para personas de 18 años o más. A tu ritmo.</span>
        </div>
        <div className="site-hero-picture" data-reveal><img src="/media/campus-students.webp" alt="Estudiantes conversando y explorando ideas en la biblioteca" width={1100} height={733} fetchPriority="high" /><span className="home-photo-label"><MapPin size={14}/>Tu futuro, desde Ecuador</span><div className="site-photo-caption"><span><GraduationCap size={24} /></span><div><strong>Una decisión que empieza contigo</strong><p>Conocerte es el primer paso.</p></div></div></div>
      </section></div>
      <section id="como-funciona" className="site-steps site-container" aria-label="Cómo funciona tu ruta" data-reveal>{steps.map((step, i) => <article key={step.title}><span className="site-step-number">0{i + 1}</span><div><h2>{step.title}</h2><p>{step.text}</p></div></article>)}</section>
      <section id="estudiantes" className="site-section site-container">
        <div className="site-section-heading" data-reveal><p className="site-eyebrow">PARA ESTUDIANTES</p><h2>Una ruta, diferentes formas de conocerte</h2><p>No hay una sola pregunta que lo resuelva todo. Cada herramienta aporta una perspectiva para pensar tu futuro.</p></div>
        <PerspectiveExplorer />
        <p className="site-tools-note">Tus resultados son un punto de partida para explorar, no una profesión asignada.</p>
      </section>
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
