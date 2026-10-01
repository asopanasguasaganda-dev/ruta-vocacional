import Link from 'next/link';
import {ArrowRight,BookOpen,GraduationCap,Wrench} from 'lucide-react';
import {baccalaureateTypes,learningPreferences,scienceOptions,technicalOptions} from '../../data/baccalaureate';
import {useSession} from '../../lib/session';
import './school-route-start.css';

/** The registered profile is visible before the first assessment is submitted. */
export function SchoolRouteStart(){
 const profile=useSession().values['rv360:profile']||{};
 const declared=baccalaureateTypes.find(t=>t.id===profile.baccalaureate)?.name||'Todavía no lo he elegido';
 const preference=learningPreferences.find(p=>p.id===profile.learningPreference)?.name||'Aún estoy explorando';
 const initial=profile.learningPreference==='aplicar'?'Bachillerato Técnico':profile.learningPreference==='investigar'?'Bachillerato en Ciencias':null;
 return <section className="school-start" aria-label="Tu ruta desde el registro">
  <header><span className="eyebrow">TU RUTA: BACHILLERATO → UNIVERSIDAD</span><h2>{initial?'Primera opción para explorar: '+initial:'Tu bachillerato, el primer paso de tu ruta'}</h2><p>{initial?'Tu preferencia de aprendizaje registrada apunta a esta opción. Completa el test de intereses para contrastarla y recibir áreas y carreras recomendadas.':'Compara Ciencias y Técnico. Tus respuestas en los tests permitirán sugerir una modalidad, sus áreas y las carreras universitarias relacionadas.'}</p></header>
  <dl className="school-start-profile"><div><dt>Etapa educativa</dt><dd>{profile.stage||'Por completar'}</dd></div><div><dt>Bachillerato registrado</dt><dd>{declared}{profile.specialty&&' · '+profile.specialty}</dd></div><div><dt>Cómo prefieres aprender</dt><dd>{preference}</dd></div></dl>
  <ol className="school-start-steps"><li><span>1</span><div><strong>Tu perfil de bachillerato</strong><p>Etapa, modalidad y especialidad guardadas desde el registro.</p></div></li><li><span>2</span><div><strong>Ciencias o Técnico y sus áreas</strong><p>Entrega tus tests para conocer la afinidad de tus intereses y tus fortalezas declaradas.</p></div></li><li><span>3</span><div><strong>Carreras y universidades</strong><p>Consulta las conexiones, las instituciones y las recomendaciones para avanzar.</p></div></li></ol>
  <div className="school-start-options">{[{title:'Bachillerato en Ciencias',Icon:BookOpen,copy:'Formación general: explora áreas y asignaturas antes de elegir una carrera universitaria.',options:scienceOptions},{title:'Bachillerato Técnico',Icon:Wrench,copy:'Formación con una figura profesional: compara especialidades y proyectos, y después su conexión universitaria.',options:technicalOptions}].map(({title,Icon,copy,options})=><article key={title}><Icon size={23}/><h3>{title}</h3><p>{copy}</p><ul>{options.slice(0,3).map(o=><li key={o.id}>{o.name}</li>)}</ul><small>Ejemplos para conocer; tus recomendaciones aparecerán al entregar los tests.</small></article>)}</div>
  <div className="school-start-actions"><Link className="button button--primary" href="/evaluacion/intereses"><GraduationCap size={18}/>Descubrir mi orientación<ArrowRight size={17}/></Link><Link className="button button--secondary" href="/mi-ruta/perfil">Revisar mi perfil escolar</Link></div>
 </section>;
}
