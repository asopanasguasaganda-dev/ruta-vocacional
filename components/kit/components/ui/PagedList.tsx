import {Children,useEffect,useState,type ReactNode} from 'react';
import './pagination.css';
export function PagedList({children,className='',label='elementos',resetKey=''}:{children:ReactNode;className?:string;label?:string;resetKey?:string}){
 const items=Children.toArray(children),[page,setPage]=useState(1),pages=Math.max(1,Math.ceil(items.length/10)),current=Math.min(page,pages);
 useEffect(()=>setPage(1),[resetKey]);
 return <section className="paged-list" aria-label={'Lista de '+label}><div className={className}>{items.slice((current-1)*10,current*10)}</div><nav className="list-pagination" aria-label={'Paginación de '+label}><span aria-live="polite">{items.length?`${(current-1)*10+1}–${Math.min(current*10,items.length)} de ${items.length}`:'Sin resultados'} {label}</span><div><button type="button" disabled={current===1} onClick={()=>setPage(current-1)}>Anterior</button><span>Página {current} de {pages}</span><button type="button" disabled={current===pages} onClick={()=>setPage(current+1)}>Siguiente</button></div></nav></section>;
}
