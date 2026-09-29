import {PagedList} from '../../components/ui/PagedList';
import {useState} from 'react';
import {Card} from '../../components/ui/primitives';
export function ReportContext({report}:{report:any}){
 const interest=report.instruments.find((s:any)=>s.instrumentId==='intereses');
 const scores=(interest?.scores||[]).map((s:any)=>s.raw as number),difference=scores.length?Math.max(...scores)-Math.min(...scores):0;
 const questions=report.instruments.reduce((n:number,s:any)=>n+s.instrument.questions.filter((q:any)=>s.answers[q.id]!==undefined).length,0);
 return <><div className="report-indicators"><Card><span>Tests entregados</span><strong>{report.instruments.length}</strong><small>Versiones guardadas en este reporte</small></Card><Card><span>Respuestas guardadas</span><strong>{questions}</strong><small>Respuestas presentes en las entregas</small></Card><Card><span>Diferencia entre intereses</span><strong>{interest?difference:'—'} <small>{interest?'/ 20':''}</small></strong><small>{!interest?'Completa el test de intereses':difference===0?'Todas las dimensiones están empatadas':'Distancia entre la mayor y menor suma RIASEC'}</small></Card></div><details className="report-method"><summary>Cómo leer estos resultados</summary><p>RIASEC resume intereses declarados en seis dimensiones. Cada suma va de 5 a 25. Autoconocimiento expresa la frecuencia indicada en las respuestas, transformada a una escala de 20 a 100: no es un porcentaje de aptitud ni una probabilidad de éxito.</p><p>El marco RIASEC cuenta con investigación publicada, pero eso no valida automáticamente las preguntas locales de esta plataforma. No se dispone de un estudio de validez, baremos o capacidad predictiva de estos cuestionarios para Ecuador. Las recomendaciones son hipótesis para contrastar con experiencias, mallas curriculares y acompañamiento humano.</p><a href="https://www.onetcenter.org/IP.html" target="_blank" rel="noreferrer">Consultar el marco de exploración de intereses de O*NET</a></details></>;
}
export function CareerOfferList({offers=[],compact=false}:{offers?:any[];compact?:boolean}){
 const unique=offers.filter((o,i)=>offers.findIndex(x=>x.institution===o.institution&&x.location===o.location&&x.modality===o.modality)===i);
 const render=(o:any)=><div className="career-offer" key={o.id}><b>{o.institution}</b><span>{o.title}</span><small>{o.location} · {o.modality} · {o.funding}</small></div>;
 const initial=compact?2:4;
 return <section className="career-offers"><h3>Dónde puedes estudiar</h3>{!unique.length?<p>No hay instituciones registradas para esta carrera en la consulta disponible.</p>:<><p className="small muted">{unique.length} opciones de institución, sede y modalidad.</p>{unique.slice(0,initial).map(render)}{unique.length>initial&&<details><summary>Ver las {unique.length} opciones de estudio</summary><PagedList className="stack" label="opciones de estudio">{unique.map(render)}</PagedList></details>}</>}<a href="https://appcmi.ces.gob.ec/oferta_vigente/" target="_blank" rel="noreferrer">Consultar la oferta oficial ↗</a></section>;
}
export function CatalogContext({report}:{report:any}){
 const source=report.catalogSource;if(!source)return null;
 return <details className="report-method"><summary>Fuente de las universidades recomendadas</summary><p>Oferta de tercer nivel de Ecuador, consultada el {source.date}. Las opciones mostradas corresponden a las carreras de tus resultados; no confirman cupos ni admisión abierta.</p><a href={source.sourceUrl} target="_blank" rel="noreferrer">Consultar fuente oficial: {source.source}</a></details>;
}
