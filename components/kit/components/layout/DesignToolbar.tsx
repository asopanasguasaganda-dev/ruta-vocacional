'use client';
import { usePathname } from 'next/navigation';
import { enterDesignRole } from '../../lib/design-preview';
import './design-toolbar.css';

export function DesignToolbar(){
  const path=usePathname();
  if(process.env.NEXT_PUBLIC_DESIGN_PREVIEW!=='true')return null;
  const enter=(role:'student'|'admin')=>{enterDesignRole(role);window.location.assign(role==='admin'?'/admin/cursos':'/mi-ruta/cursos');};
  return <aside className="design-toolbar" aria-label="Controles de la demostración">
    <p><strong>Diseño interactivo</strong><span>Datos de muestra · cambios solo en este navegador</span></p>
    <nav aria-label="Cambiar vista de diseño">
      <button type="button" aria-current={path.startsWith('/mi-ruta')?'page':undefined} onClick={()=>enter('student')}>Estudiante</button>
      <button type="button" aria-current={path.startsWith('/admin')?'page':undefined} onClick={()=>enter('admin')}>Administración</button>
      <button type="button" onClick={async()=>{if(!window.confirm('¿Reiniciar los cursos y avances de muestra de este navegador?'))return;const {resetDesignTraining}=await import('../../lib/design-training');resetDesignTraining();window.location.reload();}}>Reiniciar muestra</button>
    </nav>
  </aside>;
}
