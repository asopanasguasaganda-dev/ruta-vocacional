import { useState } from 'react';
import { careers } from '../../data/careers';
import { CareerDetail } from './Careers';
import { CustomTests } from "./CustomTests";
import { useSession } from "../../lib/session";
import { answerKey, completion } from '../../data/instruments';
import type { CustomTest } from '../admin/TestManager';
import {
  ArrowRight,
  Brain,
  Check,
  Compass,
  GraduationCap,
  Heart,
  Sparkles,
  Target,
  BookOpen,
  Bookmark,
} from "lucide-react";
import type { Navigate } from "../../types";
import {
  ActionLink,
  Badge,
  Button,
  Card,
  MetricCard,
  PageHeader,
  Progress,
  SectionTitle,
} from "../../components/ui/primitives";
import { AssessmentCard } from "../../components/domain/AssessmentCard";
import { useAssessment } from "../../lib/useAssessment";
import { useLocalState, isStringArray } from "../../lib/storage";
export function StudentDashboard({navigate}:{navigate:Navigate}) {
 const {counts,totals}=useAssessment();const session=useSession();
 const [selectedCareer,setSelectedCareer]=useState<(typeof careers)[number]|null>(null);
 const [saved,setSaved]=useLocalState<string[]>('rv360:saved-careers',[],isStringArray),[done]=useLocalState<string[]>('rv360:course-done',[],isStringArray);
 const assigned=(session.values['rv360:custom-tests']||[]).filter((t:any)=>t.status==='Publicado');const submissions=session.values['rv360:submissions']||[];const stages=[{title:'Intereses',icon:Brain,view:'intereses',ready:submissions.some((s:any)=>s.instrument_id==='intereses'),started:counts[0]>0},{title:'Valores',icon:Heart,view:'valores',ready:submissions.some((s:any)=>s.instrument_id==='valores'),started:counts[1]>0},{title:'Autoconocimiento',icon:Compass,view:'autoconocimiento',ready:submissions.some((s:any)=>s.instrument_id==='autoconocimiento'),started:counts[2]>0},{title:'Mi plan',icon:Target,view:'mi-plan',ready:done.length===8,started:done.length>0}];const completed=stages.filter(s=>s.ready).length;
 const nextIndex=stages.findIndex(s=>!s.ready),next=nextIndex<0?null:stages[nextIndex],NextIcon=next?.icon||Check;
 const nextDescriptions=['Completa la exploración de intereses para descubrir qué actividades te motivan.','Reflexiona sobre los valores y ambientes que te importan.','Reconoce tus fortalezas y tu manera de tomar decisiones.','Convierte lo que descubriste en acciones para tu futuro.'];
 const nextCount=nextIndex===3?done.length:counts[nextIndex]||0,nextTotal=nextIndex===3?8:totals[nextIndex]||1;

 return <><header className="page-header student-greeting"><div><h1>Hola, <span>{session.user?.name.split(' ')[0]||'estudiante'}</span></h1><p className="muted">Cada paso te ayuda a conocerte mejor.</p></div></header><div className="stack"><Card className="welcome-card"><div><h2>Continúa descubriendo<br/>lo que te interesa</h2><Progress value={completed} total={4} label={'Ruta base · '+completed+' de 4 etapas completadas'}/><Button icon={<ArrowRight size={17}/>} onClick={()=>navigate((next?.view||'resultados') as any)}>{next?(next.started?'Continuar: ':'Comenzar: ')+next.title:'Ver mis resultados'}</Button></div><img src="/assets/brain.webp" alt=""/></Card><div className="journey-stages">{stages.map((step,i)=><button key={step.title} className={nextIndex===i?'is-next':''} aria-label={step.title+' · '+(step.ready?'Completado':step.started?'En curso':'Pendiente')} onClick={()=>navigate(step.view as any)}><span className="route-number">0{i+1}</span><step.icon/><div><strong>{step.title}</strong><Badge tone={step.ready?'success':step.started?'primary':'neutral'}>{step.ready?'Completado':step.started?'En curso':'Pendiente'}</Badge></div></button>)}</div>{assigned.length>0&&<Card className="row between"><p><b>{assigned.length} evaluaciones asignadas por tu institución</b><br/><small className="muted">{assigned.filter((t:any)=>submissions.some((s:any)=>s.instrument_id===t.id&&s.version===t.version)).length} de {assigned.length} tests de la asignación actual entregados. Esta lista se actualiza al publicar o archivar instrumentos; la ruta base mantiene sus cuatro etapas.</small></p><Button variant="secondary" size="sm" onClick={()=>navigate('evaluaciones')}>Ver asignaciones</Button></Card>}<div className="grid grid-3 dashboard-lower"><Card className="feature-card"><h2>Tu siguiente paso</h2><p className="muted">{next?nextDescriptions[nextIndex]:'Completaste las cuatro etapas. Vuelve a tus resultados y sigue explorando posibilidades.'}</p><div className="dashboard-mini"><span className="icon-tile"><NextIcon/></span><div><b>{next?.title||'Tu ruta completada'}</b><p className="small muted">{next?`${nextCount} de ${nextTotal} ${nextIndex===3?'estaciones completadas':'respuestas guardadas'}`:'Cuatro etapas para conocerte mejor'}</p><Progress value={next?nextCount:4} total={next?nextTotal:4} label="Avance"/></div></div><Button onClick={()=>navigate((next?.view||'resultados') as any)}>{next?'Continuar ahora':'Ver mis resultados'} <ArrowRight size={16}/></Button></Card><Card className="feature-card"><h2>Explora mientras avanzas</h2><p className="muted">Descubre información útil que te acompañará en tu camino.</p><button className="dashboard-resource" onClick={()=>navigate('carreras')}><img src="/assets/resource-3.webp" alt=""/><span><b>Conoce una carrera</b><small>Explora perfiles, áreas de estudio y posibilidades.</small></span><ArrowRight size={16}/></button><button className="dashboard-resource" onClick={()=>navigate('recursos')}><img src="/assets/software.webp" alt=""/><span><b>Prepara tus preguntas</b><small>Resuelve dudas para conversar con tu familia y docentes.</small></span><ArrowRight size={16}/></button></Card><Card className="feature-card"><div className="row"><Bookmark size={21}/><h2>Mis favoritos</h2></div><p className="muted">Carreras que te interesan por ahora.</p>{saved.length?<div className="dashboard-favorites">{careers.filter(c=>saved.includes(c.id)).slice(0,3).map(c=><button key={c.id} onClick={()=>setSelectedCareer(c)}><span className="icon-tile"><GraduationCap size={22}/></span><span><b>{c.name}</b><small>{c.area}</small></span><ArrowRight size={16}/></button>)}<ActionLink onClick={()=>navigate('carreras')}>Ver todas mis opciones</ActionLink></div>:<div className="favorites-empty"><Compass/><p>Explora carreras y guarda las que despierten tu curiosidad.</p><ActionLink onClick={()=>navigate('carreras')}>Explorar carreras</ActionLink></div>}</Card></div></div><CareerDetail career={selectedCareer} onClose={()=>setSelectedCareer(null)} saved={!!selectedCareer&&saved.includes(selectedCareer.id)} onSave={()=>{if(selectedCareer)setSaved(saved.includes(selectedCareer.id)?saved.filter(id=>id!==selectedCareer.id):[...saved,selectedCareer.id]);}}/></>;
}
export function Assessments({ navigate }: { navigate: Navigate }) {
  const { counts, totals, complete,submitted } = useAssessment();
  return (
    <>
      <PageHeader
        eyebrow="CONÓCETE"
        title="Mis evaluaciones"
        description="Conoce tus intereses, valores y forma de decidir."
        actions={<Badge tone="success">{complete} de 3 completadas</Badge>}
      />
      <div className="stack">
        <div className="grid grid-2 assessment-grid">
          <AssessmentCard
            title="Intereses RIASEC"
            description="Descubre seis formas de conectar con actividades y áreas de estudio."
            icon={Brain}
            submitted={submitted[0]}
            answered={counts[0]}
            total={totals[0]}
            duration="A tu ritmo"
            onStart={() => navigate(submitted[0]?"resultados":"intereses")}
          />
          <AssessmentCard
            title="Valores y preferencias"
            description="Reflexiona sobre los ambientes, motivaciones y valores que te importan."
            icon={Heart}
            submitted={submitted[1]}
            answered={counts[1]}
            total={totals[1]}
            duration="Reflexión breve"
            onStart={() => navigate(submitted[1]?"resultados":"valores")}
          />
          <AssessmentCard
            title="Autoconocimiento"
            description="Observa cómo reconoces tus fortalezas y construyes tus decisiones."
            icon={Compass}
            submitted={submitted[2]}
            answered={counts[2]}
            total={totals[2]}
            duration="A tu ritmo"
            onStart={() => navigate(submitted[2]?"resultados":"autoconocimiento")}
          />
        <Card className="feature-card lab-entry">
          <div className="row">
            <span className="icon-tile teal">
              <Sparkles />
            </span>
            <div>
              <h3>Laboratorio cognitivo</h3>
              <p className="muted small">
                Actividades opcionales de atención y memoria. No determinan tu
                carrera.
              </p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate("laboratorio")}>
            Explorar actividades
          </Button>
        </Card>
        </div>
        <CustomTests/>
        <Card className="assessment-guidance">
          <SectionTitle title="No hay respuestas correctas o incorrectas" />
          <div className="grid grid-3">
            {[
              "Responde según tus intereses actuales, no según lo que otras personas esperan.",
              "Puedes guardar el avance y regresar a tu cuenta desde cualquier dispositivo.",
              "Tus resultados son un punto de partida para investigar y conversar.",
            ].map((text, i) => (
              <div className="row align-start" key={i}>
                <span className="timeline-mark">{i + 1}</span>
                <p className="small muted grow">{text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
