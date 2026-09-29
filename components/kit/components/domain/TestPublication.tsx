import {useState} from 'react';
import {Button,Notice} from '../ui/primitives';
import {refreshSession} from '../../lib/session';
import {downloadText} from '../../lib/storage';
export function TestPublication({admin=false}:{admin?:boolean}){
 const [packet,setPacket]=useState<any>(null),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 if(process.env.NEXT_PUBLIC_DESIGN_PREVIEW!=='true')return null;
 return <section className="report-method">
 <p className="small muted">Contenido local: se comparte entre cuentas y pestañas del mismo perfil del navegador. Otro perfil o equipo necesita cargar la publicación.</p>
 <details><summary>{admin?'Compartir tests y simuladores con otro perfil':'Recibir tests y simuladores de administración'}</summary>
 {admin?<div className="stack"><p>Descarga una publicación y ábrela en el panel del estudiante del otro perfil. Incluye tests publicados para todos y simuladores publicados con sus carreras. No incluye cuentas, contraseñas, notas ni respuestas de estudiantes.</p>
 <Button variant="secondary" disabled={busy} onClick={async()=>{setBusy(true);try{const {exportTestPublication}=await import('../../lib/test-publication');const p=exportTestPublication();downloadText('publicacion.rv360.json',JSON.stringify(p,null,2),'application/json');setMessage(p.tests.length+' tests y '+p.simulators.length+' simuladores incluidos. Carga este archivo en el otro perfil desde Mis tests o Cursos.');setError('');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>Descargar publicación</Button>
 <p className="small muted">Para probar sin trasladar archivos, utiliza «Probar como estudiante». Para compartir cambios posteriores, descarga y carga una nueva publicación.</p></div>:<div className="stack">
 <p>Selecciona el archivo descargado por administración. Los tests aparecerán en Mis tests y los simuladores en Cursos, dentro de las carreras recomendadas por tus resultados.</p>
 <label className="field">Archivo de publicación<input type="file" accept=".json" disabled={busy} onChange={async e=>{setPacket(null);setError('');setMessage('');try{const f=e.target.files?.[0];if(!f)return;if(f.size>10*1024*1024)throw Error('El archivo supera 10 MB.');const {validateTestPublication}=await import('../../lib/test-publication');setPacket(validateTestPublication(JSON.parse(await f.text())));}catch(e){setError((e as Error).message);}}}/></label>
 {packet&&<><p>{packet.tests.length} tests · {packet.simulators?.length||0} simuladores · {new Date(packet.createdAt).toLocaleString('es-EC')}</p><p>Actualiza el contenido de este origen y conserva tus respuestas, intentos y notas.</p>
 <Button disabled={busy} onClick={async()=>{setBusy(true);try{const {importTestPublication}=await import('../../lib/test-publication');const count=importTestPublication(packet);await refreshSession();setMessage(count+' tests y '+(packet.simulators?.length||0)+' simuladores cargados. Los simuladores se muestran según tus carreras recomendadas.');setPacket(null);setError('');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>Cargar publicación</Button></>}
 </div>}
 {error&&<Notice tone="danger">{error}</Notice>}{message&&<Notice tone="success">{message}</Notice>}
 </details></section>;
}
