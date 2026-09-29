import {Button} from '../../components/ui/primitives';
import {CareerOfferList} from './ReportContext';
export function RecommendedCareerCard({report,rec,index,onFollow,onOpen}:{report:any;rec:any;index:number;onFollow:(id:string)=>void;onOpen:(rec:any)=>void}){
 const career=report.catalog.find((c:any)=>c.id===rec.careerId);
 return <article className="rd-career rd-recommended"><span className="rd-career-number">OPCIÓN {String(index+1).padStart(2,'0')} · SEGÚN TUS RESPUESTAS</span><h4>{career?.name||rec.careerId}</h4><p>{rec.comparison||rec.explore}</p><details><summary>Por qué aparece en tus resultados</summary><p>{rec.reason}</p></details><CareerOfferList offers={report.offers?.[rec.careerId]||career?.offers||[]} compact/><div className="rd-follow-actions"><Button onClick={()=>onFollow(rec.careerId)}>Seguir curso</Button><Button variant="secondary" onClick={()=>onOpen(rec)}>Conocer la carrera</Button></div></article>;
}
export function EcuadorExplorer({report,onOpen,onFollow}:{report:any;onOpen:(value:any)=>void;onFollow:(id:string)=>void}){
 const recommendations=report.analysis?.recommendations||[];
 return <section className="ec-explorer"><div className="rd-panel"><h3>Tus carreras y dónde estudiarlas</h3><p>Estas son las {recommendations.length} opciones recomendadas por tus resultados. Ya incluimos las instituciones, ciudades y modalidades para que puedas comparar.</p><small>Oferta consultada el {report.catalogSource?.date}. Confirma fechas y requisitos de admisión con la institución.</small></div><div className="rd-career-grid">{recommendations.map((rec:any,index:number)=><RecommendedCareerCard key={rec.careerId} {...{report,rec,index,onFollow,onOpen}}/>)}</div>{!recommendations.length&&<p>Completa los tests con criterios de orientación para recibir tus carreras recomendadas.</p>}</section>;
}
