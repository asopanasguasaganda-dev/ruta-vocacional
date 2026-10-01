import { baccalaureateTypes, learningPreferences, technicalOptions } from '../../data/baccalaureate';
import type { EducationData } from '../../../../lib/education-types';
import { Field, SelectField } from '../ui/primitives';
import { useId } from 'react';

export function BaccalaureateFields({value,onChange}:{value:EducationData;onChange:(value:EducationData)=>void}) {
  const listId=useId();
  return <fieldset className="education-fields"><legend>Tu perfil de bachillerato</legend>
    <p>Primero conoce tus opciones de bachillerato; después conecta tus intereses con la universidad.</p>
    <SelectField label="Bachillerato que cursas, cursaste o has elegido" value={value.baccalaureate||'por-definir'} onChange={e=>onChange({...value,baccalaureate:e.target.value,specialty:''})}>
      {baccalaureateTypes.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
    </SelectField>
    {['tecnico','otro'].includes(value.baccalaureate||'')&&<>
      <Field label="Especialidad o figura profesional" value={value.specialty||''} list={listId} maxLength={140} placeholder="Ejemplo: Informática, Contabilidad…" hint="Escribe el nombre que utiliza tu colegio. Puedes dejarlo vacío si aún no lo has elegido." onChange={e=>onChange({...value,specialty:e.target.value})}/>
      <datalist id={listId}>{technicalOptions.map(t=><option key={t.id} value={t.name}/>)}</datalist>
    </>}
    {value.baccalaureate==='ciencias'&&<p className="small muted">Ciencias ofrece una formación general. Las áreas de interés del informe ayudan a explorar asignaturas y futuras carreras.</p>}
    <SelectField label="¿Qué te gustaría priorizar al aprender?" value={value.learningPreference||'por-definir'} onChange={e=>onChange({...value,learningPreference:e.target.value})}>
      {learningPreferences.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
    </SelectField>
    <p className="small muted">Tu bachillerato actual no limita las carreras que puedes explorar. Contrasta las recomendaciones con tus trabajos, docentes y orientación escolar.</p>
  </fieldset>;
}
