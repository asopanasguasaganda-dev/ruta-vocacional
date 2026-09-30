import {jsPDF} from 'jspdf';
import {answerText} from './test-answer-text';
const text=(v:any)=>String(v??'').replace(/[\u0000-\u0008]/g,'').replace(/[–—]/g,'-');
const number=(v:any)=>typeof v==='number'&&Number.isFinite(v)?v.toLocaleString('es-EC',{maximumFractionDigits:2}):'Pendiente';
const date=(v:any)=>v&&!Number.isNaN(Date.parse(v))?new Date(v).toLocaleString('es-EC',{timeZone:'America/Guayaquil'}):'No registrado';
/** Shared printable report: browser and server use the same content and pagination. */
export function createTrainingReport(a:any){
 if(!a?.result||!a.instrument)throw Error('El resultado todavía no está disponible.');
 const doc=new jsPDF(),r=a.result,t=a.instrument;let y=46;
 const navy='#14223E',violet='#6652BA',muted='#53627C';
 doc.setProperties({title:'Resultado - '+text(t.title),subject:'Informe de preparación académica',author:'Ruta Vocacional 360°'});
 const header=()=>{doc.setFillColor(navy);doc.rect(0,0,210,32,'F');doc.setTextColor('#FFFFFF');doc.setFont('helvetica','bold');doc.setFontSize(16);doc.text('Ruta Vocacional 360°',18,15);doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text('CURSOS Y SIMULADORES · INFORME DE RESULTADOS',18,24);y=44;};
 const room=(height:number)=>{if(y+height>275){doc.addPage();header();}};
 const paragraph=(value:any,size=10,color=navy,bold=false)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);const rows=doc.splitTextToSize(text(value),174);const height=rows.length*(size*.48+1)+3;if(height<220)room(height);for(const row of rows){room(size*.48+1);doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(color);doc.text(row,18,y);y+=size*.48+1;}y+=3;};
 const section=(title:string)=>{room(24);y+=4;doc.setDrawColor('#DCD7EE');doc.line(18,y,192,y);y+=9;paragraph(title,13,violet,true);};
 header();paragraph('TU RESULTADO DE PREPARACIÓN',9,violet,true);paragraph(t.presentation?.title||t.title,20,navy,true);
 paragraph('Estudiante: '+(a.name||'No registrado'),11,navy,true);
 paragraph((a.mode==='exam'?'Simulación de examen':'Práctica')+' · Versión '+(t.version||'1')+' · Revisión '+(r.revision||1),9,muted);
 paragraph('Inicio: '+date(a.started_at)+' · Entrega: '+date(a.finished_at||a.closed_at),9,muted);
 room(33);doc.setFillColor('#F1EDFB');doc.roundedRect(18,y,174,27,3,3,'F');
 for(const [i,label,value] of [[0,'CALIFICACIÓN',r.state==='annulled'?'Anulado':r.percent==null?'Pendiente':number(r.percent)+' / 100'],[1,'PUNTOS',number(r.raw)+' / '+number(r.max)],[2,'OMITIDAS',String(r.coverage?.omitted??0)]] as const){doc.setFontSize(8);doc.setFont('helvetica','bold');doc.setTextColor(violet);doc.text(label,23+i*58,y+8);doc.setFontSize(15);doc.setTextColor(navy);doc.text(value,23+i*58,y+19);}y+=35;
 paragraph(r.note||'Preparación académica. Este resultado no equivale a un puntaje oficial de admisión.',9,muted);
 if(r.state==='pending-review')paragraph('Resultado provisional: hay respuestas pendientes de revisión.',10,violet,true);
 if(r.annulled?.length)paragraph(r.annulled.length+' preguntas anuladas. '+(r.annulmentPolicy||'Se excluyen del cálculo.'),10);
 section('01 · Resultados por tema');
 for(const area of r.areas||[]){room(27);paragraph(area.area,11,navy,true);paragraph(number(area.raw)+' de '+number(area.max)+' puntos · '+number(area.percent)+' %'+(area.weight?' · Peso '+area.weight+' %':''),9,muted);room(6);doc.setFillColor('#E9ECF3');doc.roundedRect(18,y,174,3,1,1,'F');if(Number.isFinite(area.percent)&&area.percent>0){doc.setFillColor(violet);doc.rect(18,y,174*Math.min(100,Math.max(0,area.percent))/100,3,'F');}y+=9;}
 section('02 · Respuestas y explicación');
 (t.questions||[]).forEach((q:any,i:number)=>{room(35);paragraph('PREGUNTA '+(i+1)+(q.section?' · '+q.section:''),9,violet,true);paragraph(q.text,11,navy,true);
 const trace=(r.trace||[]).filter((v:any)=>v.questionId===q.id);const annulled=r.annulled?.includes(q.id);
 if(annulled)paragraph('Anulada: excluida del cálculo.',9,violet);
 else if(trace.length)paragraph('Puntos: '+number(trace.reduce((sum:number,v:any)=>sum+(v.subtotal||0),0))+' / '+number(trace.reduce((sum:number,v:any)=>sum+(v.max||0),0)),9,muted);
 paragraph('Tu respuesta: '+answerText(t,q,(r.answers||a.answers||{})[q.id]),10);
 const explanation=a.explanations?.find((e:any)=>e.id===q.id)?.text;
 if(explanation)paragraph('Explicación: '+explanation,10,muted);
 y+=3;});
 if(a.resultHistory?.length){section('03 · Historial de revisiones');for(const h of a.resultHistory)paragraph('Revisión '+h.revision+' · '+date(h.created_at)+' · '+h.reason,9,muted);}
 paragraph('La calificación académica es independiente de tus intereses vocacionales y del avance del curso.',9,muted);
 paragraph('Registro del intento: '+text(a.id||'No registrado'),8,muted);
 const pages=doc.getNumberOfPages();for(let i=1;i<=pages;i++){doc.setPage(i);doc.setDrawColor('#DDDDEA');doc.line(18,282,192,282);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(muted);doc.text('Ruta Vocacional 360° · Preparación académica',18,288);doc.text('Página '+i+' de '+pages,192,288,{align:'right'});}
 return doc;
}
