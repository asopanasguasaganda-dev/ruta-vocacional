import {useState} from 'react';
import type {Instrument} from '../../types';
import {prepareImportedPresentation} from '../../lib/import-presentation';
import {Button,Field,TextareaField,Notice} from '../ui/primitives';
export function PresentationEditor({instrument,onChange}:{instrument:Instrument;onChange:(presentation:NonNullable<Instrument['presentation']>)=>void}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const value=instrument.presentation||{title:'',summary:''};
 return <div className="stack-sm"><Field label="Título breve para estudiantes" maxLength={100} value={value.title} onChange={e=>onChange({...value,title:e.target.value})}/><TextareaField label="Introducción breve para estudiantes" maxLength={280} value={value.summary} onChange={e=>onChange({...value,summary:e.target.value})}/><Button variant="secondary" loading={busy} disabled={!instrument.title.trim()} onClick={async()=>{setBusy(true);setMessage('');try{const result=await prepareImportedPresentation({tests:[{...instrument}],warnings:[]},true);if(result.tests[0].presentation)onChange(result.tests[0].presentation);setMessage(result.warnings.join(' ')||'La IA está disponible en la plataforma publicada. Puedes editar estos campos directamente.');}catch{setMessage('No se pudo generar el resumen. Puedes editar estos campos directamente.');}finally{setBusy(false);}}}>Preparar introducción con IA</Button>{message&&<Notice>{message}</Notice>}</div>;
}
