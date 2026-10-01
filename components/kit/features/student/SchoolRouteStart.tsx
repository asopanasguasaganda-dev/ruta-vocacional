import Link from 'next/link';
import {ArrowRight,BookOpen,GraduationCap,Wrench} from 'lucide-react';
import {baccalaureateTypes,learningPreferences,scienceOptions,technicalOptions,isChoosingBaccalaureate} from '../../data/baccalaureate';
import {useSession} from '../../lib/session';
import './school-route-start.css';

/** The registered profile is visible before the first assessment is submitted. */
export function SchoolRouteStart(){
 const profile=useSession().values['rv360:profile']||{};
 const declared=baccalaureateTypes.find(t=>t.id===profile.baccalaureate)?.name||'Todavía no lo he elegido';
 const preference=learningPreferences.find(p=>p.id===profile.learningPreference)?.name||'Aún estoy explorando';
 return <section className="school-start" aria-label="Tu ruta desde el registro">
  <header><span className="eyebrow">TU RUTA: BACHILLERATO → UNIVERSIDAD</span><h2>{isChoosingBaccalaureate(profile.stage)?'¿Qué bachillerato puedo elegir?':'Descubre tu ruta de estudios'}</h2><p>Si estás en 8.º, 9.º o 10.º de EGB y pasarás a primero de BGU, esta guía es para ti. No necesitas tenerlo decidido. Comienza con los tests: tus respuestas ayudarán a comparar Ciencias y Técnico, explorar sus áreas y después conectar con carreras universitarias.</p></header>
  <dl className="school-start-profile"><div><dt>Etapa educativa</dt><dd>{profile.stage||'Por completar'}</dd></div><div><dt>Bachillerato registrado</dt><dd>{declared}{profile.specialty&&' · '+profile.specialty}</dd></div><div><dt>Cómo prefieres aprender</dt><dd>{preference}</dd></div></dl>
  <ol className="school-start-steps"><li><span>1</span><div><strong>Descubre tus intereses y fortalezas</strong><p>Completa los tests sin elegir primero una modalidad ni una carrera.</p></div></li><li><span>2</span><div><strong>Compara Ciencias y Técnico</strong><p>En Mis resultados verás tu orientación, áreas, especialidades y actividades recomendadas.</p></div></li><li><span>3</span><div><strong>Explora carreras y universidades</strong><p>Conecta esas áreas con opciones universitarias y recomendaciones para avanzar.</p></div></li></ol>
  <div className="school-start-options">{[{title:'Bachillerato en Ciencias',Icon:BookOpen,copy:'Formación general: explora áreas y asignaturas antes de elegir una carrera universitaria.',options:scienceOptions},{title:'Bachillerato Técnico',Icon:Wrench,copy:'Formación con una figura profesional: compara especialidades y proyectos, y después su conexión universitaria.',options:technicalOptions}].map(({title,Icon,copy,options})=><article key={title}><Icon size={23}/><h3>{title}</h3><p>{copy}</p><ul>{options.slice(0,3).map(o=><li key={o.id}>{o.name}</li>)}</ul><small>Ejemplos para conocer; tus recomendaciones aparecerán al entregar los tests.</small></article>)}</div>
  <div className="school-start-actions"><Link className="button button--primary" href="/evaluacion/intereses"><GraduationCap size={18}/>Descubrir mi orientación<ArrowRight size={17}/></Link><Link className="button button--secondary" href="/mi-ruta/perfil">Revisar mi perfil escolar</Link></div>
 </section>;
}
