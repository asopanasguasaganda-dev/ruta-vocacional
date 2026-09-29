import { notFound,redirect } from 'next/navigation';
import { currentPageUser as currentUser } from '@/lib/server/page-session';
import { KitRoot } from '@/components/kit/Root';
import { routes } from '@/components/kit/routes';
export default async function Page({ params }: { params: Promise<{ slug:string[] }> }) {
 const {slug}=await params;const path='/'+slug.join('/');
 if(path==='/confirmar-edad'){const user=await currentUser();if(!user)redirect('/ingresar');redirect(user.role==='student'?'/mi-ruta':'/admin');}
 if(path==='/recursos')redirect('/#como-funciona');
 if(path==='/admin/ingresar')redirect('/admin/login');
 if((path.startsWith('/admin')&&path!=='/admin/login')||path.startsWith('/mi-ruta')||path.startsWith('/evaluacion/')){const user=await currentUser();if(!user)redirect(path.startsWith('/admin')?'/admin/login':'/ingresar');if(!path.startsWith('/admin')&&user.role!=='student')redirect('/admin');if(path.startsWith('/admin')&&user.role==='student')redirect('/mi-ruta');if(path.startsWith('/admin')&&user.role==='orientador'&&!['/admin','/admin/resultados','/admin/cuenta'].includes(path))redirect('/admin');}
 const retired=['/mi-ruta/plan','/mi-ruta/reflexiones','/mi-ruta/recursos','/mi-ruta/emprendimiento','/mi-ruta/laboratorio','/mi-ruta/carreras'];
 if(retired.includes(path))redirect('/mi-ruta');
 if(['/admin/contenidos','/admin/reportes','/admin/grupos'].includes(path))redirect('/admin');
 if(path==='/desarrollo/componentes')notFound();
 if(!Object.values(routes).includes(path)&&path!=='/restablecer')notFound();
 if(path==='/desarrollo/componentes'&&process.env.NODE_ENV==='production')notFound();
 return <KitRoot/>;
}
