"use client";
import "./training.css";
import {useSession} from '../../lib/session';
import {defaultPreparationLevel,schoolTarget} from '../../data/school-training';
import Link from "next/link";
import {useTraining,TrainingError} from "./shared";
import {Card} from "../../components/ui/primitives";
export function TrainingSummary(){
 const {data,error,refresh}=useTraining();
 const level=defaultPreparationLevel(useSession().values['rv360:profile']);
 if(!data)return <Card className="stack-sm training-home-summary"><span className="eyebrow">TU PREPARACIÓN</span><h2>Tu autopreparación</h2>{error?<TrainingError error={error} retry={refresh}/>:<p role="status">Cargando tus avances…</p>}</Card>;
 const attempts=data.attempts||[],recommendations=(data.recommendations||[]).filter((r:any)=>schoolTarget(r.careerId)===(level==='bachillerato'));
 const simulators=(data.simulators||[]).filter((s:any)=>s.careerIds?.some((id:string)=>recommendations.some((r:any)=>r.careerId===id)));
 const completed=simulators.filter((s:any)=>attempts.some((a:any)=>a.simulator.id===s.id&&a.state==='graded')).length;
 const active=attempts.find((a:any)=>a.state==='in_progress'&&simulators.some((s:any)=>s.id===a.simulator.id));
 const next=simulators.find((s:any)=>s.id===active?.simulator.id)||simulators.find((s:any)=>!attempts.some((a:any)=>a.simulator.id===s.id&&a.state==='graded'));
 const career=data.careers.find((c:any)=>next?.careerIds?.includes(c.id)&&recommendations.some((r:any)=>r.careerId===c.id));
 return <Card className="stack-sm training-home-summary"><span className="eyebrow">TU PREPARACIÓN</span><h2>{active?'Retoma tu simulador':recommendations.length?(level==='bachillerato'?'Explora tu bachillerato':'Practica para tus carreras'):'Descubre tu ruta de preparación'}</h2><p>{active?active.instrument.title:next?next.title:recommendations.length?(level==='bachillerato'?'Compara Ciencias y Técnico y practica sus contenidos.':'Consulta los simuladores de tus carreras recomendadas.'):'Completa tus tests para recibir recomendaciones y encontrar tu preparación.'}</p>{recommendations.length>0&&<p className="small muted">{simulators.length} simuladores disponibles · {completed} completados</p>}<Link className="button button--secondary" href={!recommendations.length?'/mi-ruta/evaluaciones':career?'/mi-ruta/cursos?carrera='+encodeURIComponent(career.id):'/mi-ruta/cursos'}>{!recommendations.length?'Comenzar mis tests':active?'Continuar mi preparación':'Ver mi autopreparación'}</Link></Card>;
}
