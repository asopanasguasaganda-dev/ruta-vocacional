import { baccalaureateTypes, learningPreferences, technicalOptions } from '../../data/baccalaureate';
import type { EducationData } from '../../../../lib/education-types';
import { SelectField } from '../ui/primitives';
import { SearchSelect } from '../ui/SearchSelect';
import './education-fields.css';

export function BaccalaureateFields({value,onChange}:{value:EducationData;onChange:(value:EducationData)=>void}) {
  return <fieldset className="education-fields"><legend>Tu perfil de bachillerato</legend>
    <p>Estos datos son opcionales y describen tu situación actual. Si todavía no sabes qué elegir, deja «Todavía no lo he elegido»: los tests te ayudarán a comparar Ciencias y Técnico en Mis resultados.</p>
    <SelectField label="Bachillerato que cursas, cursaste o has elegido" value={value.baccalaureate||'por-definir'} onChange={e=>onChange({...value,baccalaureate:e.target.value,specialty:''})}>
      {baccalaureateTypes.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
    </SelectField>
    {['tecnico','otro'].includes(value.baccalaureate||'')&&<>
      <SearchSelect label="Especialidad o figura profesional" value={value.specialty||''} allowCustom options={technicalOptions.map(t=>({value:t.name,label:t.name,detail:t.subjects}))} hint="Busca una especialidad o escribe el nombre que utiliza tu colegio. Puedes dejarlo vacío si aún no lo has elegido." onChange={specialty=>onChange({...value,specialty})}/>
    </>}
    {value.baccalaureate==='ciencias'&&<p className="small muted">Ciencias ofrece una formación general. Las áreas de interés del informe ayudan a explorar asignaturas y futuras carreras.</p>}
    <SelectField label="¿Qué te gustaría priorizar al aprender?" value={value.learningPreference||'por-definir'} onChange={e=>onChange({...value,learningPreference:e.target.value})}>
      {learningPreferences.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
    </SelectField>
    <p className="small muted">Tu bachillerato actual no limita las carreras que puedes explorar. Contrasta las recomendaciones con tus trabajos, docentes y orientación escolar.</p>
  </fieldset>;
}
