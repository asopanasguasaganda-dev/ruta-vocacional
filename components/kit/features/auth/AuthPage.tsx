import { useEffect, useState } from 'react';
import '../admin/admin-design.css';
import { previewAction, refreshSession, useSession } from '../../lib/session';
import { ArrowLeft, ShieldCheck, Compass, CheckCircle2 } from 'lucide-react';
import type { Navigate } from '../../types';
import { AuthForm, type AuthMode } from '../../components/domain/AuthForm';
import { Brand } from '../../components/layout/Brand';
import { useToast } from '../../components/ui/Toast';
import { Notice, Button, Field } from '../../components/ui/primitives';

export function AuthPage({ mode, navigate }: { mode: AuthMode; navigate: Navigate }) {
  const toast = useToast();
  const [setup,setSetup]=useState(false);
  useEffect(()=>{if(mode==='admin'&&process.env.NEXT_PUBLIC_DESIGN_PREVIEW==='true')void previewAction('auth/local-status').then(r=>setSetup(!r.adminExists));},[mode]);
  const session = useSession();
  const register = mode === 'register', admin = mode === 'admin', reset = mode === 'reset';
  const form = <AuthForm key={mode} mode={mode}
    onNavigate={next => navigate(next === 'login' ? 'ingresar' : next === 'reset' ? 'recuperar' : next === 'admin' ? 'admin-ingresar' : 'registro')}
    onSubmit={async payload => {
      if (reset) {
        await previewAction('auth/password-reset', { method: 'POST', body: JSON.stringify({ email: payload.email }) });
        return;
      }
      const result = await previewAction(register ? 'auth/register' : 'auth/login', {
        method: 'POST', body: JSON.stringify({ ...payload, admin }),
      });
      await refreshSession();
      toast(register ? 'Tu cuenta está lista.' : 'Has iniciado sesión.');
      navigate(result.user.role === 'student' ? 'mi-ruta' : 'admin');
    }} />;
  return <main id="contenido" className={`auth-shell${admin ? ' auth-shell--admin' : ''}`}>
    <header className="auth-header">
      <a href="/" aria-label="Ruta Vocacional 360°, inicio"><Brand inverse /></a>
      <a className="auth-home-link" href="/"><ArrowLeft size={16} />Volver al inicio</a>
    </header>
    <div className="auth-stage">
      <div className={`auth-card ${register ? 'auth-card--register' : admin ? 'auth-card--admin' : 'auth-card--login'}`}>
        {!register && !admin && <aside className="auth-story">
          <div className="auth-story-copy"><span className="auth-kicker">TU FUTURO, TU CAMINO</span>
            <h2>Todo empieza por <em>conocerte.</em></h2>
            <p>Descubre tus intereses y encuentra nuevas posibilidades.</p>
            <ul className="auth-story-benefits"><li>Conócete</li><li>Explora</li><li>Elige tu camino</li></ul>
          </div>
          <div className="auth-photo"><img src="/media/students-campus.webp" alt="Estudiantes universitarios compartiendo ideas y estudiando con una computadora" width={1200} height={800} fetchPriority="high" />
            <span><Compass size={20} />Un paso a la vez, a tu ritmo.</span>
          </div>
        </aside>}
        <section className="auth-main" aria-labelledby="auth-title">
          <div className="auth-heading">
            {admin && <span className="icon-tile"><ShieldCheck size={24} /></span>}
            <span className="auth-kicker">{admin ? 'ACCESO RESTRINGIDO' : register ? 'EMPIEZA TU RUTA' : reset ? 'RECUPERA TU CUENTA' : 'CONTINÚA TU RUTA'}</span>
            <h1 id="auth-title">{admin ? 'Acceso a administración' : register ? 'Crea tu cuenta' : reset ? 'Recupera tu acceso' : 'Te damos la bienvenida'}</h1>
            <p>{admin ? 'Ingresa con tus credenciales de administración.' : register ? 'Para personas de 18 años o más que buscan su primera carrera universitaria.' : reset ? (process.env.NEXT_PUBLIC_DESIGN_PREVIEW==='true'?'El envío de correos no está disponible en esta etapa.':'Te enviaremos instrucciones a tu correo.') : 'Ingresa y retoma donde lo dejaste.'}</p>
          </div>
          {setup ? <LocalAdminSetup onDone={()=>navigate('admin')}/> : session.serviceAvailable === false ? <div className="stack-sm" role="status">
            <Notice tone="warning">El acceso está temporalmente fuera de servicio. Vuelve a intentarlo más tarde.</Notice>
            <Button variant="secondary" onClick={() => void refreshSession()}>Comprobar disponibilidad</Button>
          </div> : form}
          {!admin && !reset && <p className="auth-alternative">{register ? '¿Ya tienes una cuenta?' : '¿Aún no tienes una cuenta?'}{' '}
            <a href={register ? '/ingresar' : '/registro'}>{register ? 'Ingresar' : 'Crear cuenta'}</a>
          </p>}
          {reset && <a className="auth-return" href="/ingresar">Volver al ingreso</a>}
          {admin && <p className="auth-security"><ShieldCheck size={16} />Solo para personal autorizado.</p>}
        </section>
        {register && <aside className="auth-benefits">
          <img src="/media/brain-book-icon.png" alt="" width={44} height={44} />
          <h2>Tu siguiente paso,<br />con más claridad.</h2>
          <p>No necesitas tener todas las respuestas para empezar.</p>
          <ul>{[
            ['Conoce tus intereses', 'Descubre lo que te gusta y lo que te mueve.'],
            ['Explora tus opciones', 'Conoce carreras y nuevas posibilidades.'],
            ['Construye tu plan', 'Organiza tus próximos pasos, a tu ritmo.'],
          ].map(([title, text]) => <li key={title}><CheckCircle2 size={20} /><div><h3>{title}</h3><p>{text}</p></div></li>)}</ul>
          <span className="auth-benefits-note">Tu ruta es personal. Tú eliges cómo avanzar.</span>
        </aside>}
      </div>
      {!admin && !register && <p className="auth-footer"><ShieldCheck size={15} />Un espacio personal para construir tu futuro.</p>}
    </div>
  </main>;
}

function LocalAdminSetup({onDone}:{onDone:()=>void}){
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 return <form className="auth-fields" onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{await previewAction('auth/local-admin',{method:'POST',body:JSON.stringify({name,email,password})});await refreshSession();onDone();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>
 <p>Configura tu acceso administrativo en este navegador. Después ingresarás con tu correo y contraseña.</p>
 <Field label="Nombre" value={name} onChange={e=>setName(e.target.value)} required/>
 <Field label="Correo electrónico" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
 <Field label="Contraseña" type="password" autoComplete="new-password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required/>
 {error&&<Notice tone="danger">{error}</Notice>}<Button type="submit" loading={busy}>Crear acceso administrativo</Button>
 </form>;
}
