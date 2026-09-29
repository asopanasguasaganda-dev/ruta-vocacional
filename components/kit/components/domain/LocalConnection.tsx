import {useState} from 'react';
import {useSession,refreshSession,flush} from '../../lib/session';
import {Button,Notice} from '../ui/primitives';
import './local-testing.css';
export function LocalConnection(){
 const session=useSession(),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const info=session.values['rv360:local-connection'];
 if(process.env.NEXT_PUBLIC_DESIGN_PREVIEW!=='true'||!session.user||!info)return null;
 const admin=session.user.role==='admin';
 return <details className="local-connection"><summary>Comprobar conexión local · {info.published} tests publicados aquí</summary><div className="stack-sm">
 <p>Espacio local: <strong>{info.workspaceId}</strong></p>
 <p>Compara este identificador en administración y estudiante. Debe ser el mismo para compartir las publicaciones sin trasladar archivos.</p>
 <p>{info.published} tests publicados · {info.drafts} borradores{!admin&&<> · {info.assigned} tests publicados asignados a tu cuenta · {info.originals} tests originales disponibles</>}</p>
 {!info.published?<Notice>Este espacio no contiene tests creados o importados que estén publicados. Si administración los muestra, compara el identificador de ambos paneles.</Notice>:!admin&&info.assigned<info.published?<Notice>Parte de los tests publicados está asignada a otros estudiantes o corresponde a versiones anteriores. Revisa la asignación y la versión desde administración.</Notice>:null}
 <Button size="sm" variant="secondary" loading={busy} onClick={async()=>{setBusy(true);setMessage('');try{await flush();await refreshSession();setMessage('Catálogo local consultado nuevamente.');}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}}>Actualizar catálogo local</Button>
 {message&&<p role="status">{message}</p>}
 </div></details>;
}
