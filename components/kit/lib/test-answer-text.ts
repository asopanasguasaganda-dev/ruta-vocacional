import type {Instrument,Question} from '../types';
export function answerText(t:Instrument,q:Question,value:any):string{
 if(value===undefined||value===null||value==='')return 'Sin respuesta';
 const options=q.options||t.options,label=(v:unknown)=>options.find(o=>o.value===v)?.label||String(v);
 if(q.type==='matrix')return (q.rows||[]).map(r=>r.label+': '+(Array.isArray(value[r.id])?value[r.id].map(label).join(', '):label(value[r.id]??'Sin respuesta'))).join('; ');
 if(['open','short','number'].includes(q.type||''))return String(value);
 return Array.isArray(value)?value.map(label).join(', '):label(value);
}
