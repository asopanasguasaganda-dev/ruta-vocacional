import '../admin/admin-design.css';
import { previewAction, refreshSession } from '../../lib/session';
import { ArrowLeft, ShieldCheck, Compass, CheckCircle2 } from 'lucide-react';
import type { Navigate } from '../../types';
import { AuthForm, type AuthMode } from '../../components/domain/AuthForm';
import { Brand } from '../../components/layout/Brand';
import { useToast } from '../../components/ui/Toast';

export function AuthPage({ mode, navigate }: { mode: AuthMode; navigate: Navigate }) {
  const toast = useToast();
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
      toast(process.env.NEXT_PUBLIC_DESIGN_PREVIEW==='true'?'Tu sesión de prueba está lista en esta pestaña.':register ? 'Tu cuenta está lista.' : 'Has iniciado sesión.');
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
          <div className="auth-photo"><img src="/media/vocational-background-poster.webp" alt="Cerebro iluminado en violeta y azul sobre un libro abierto" />
            <span><Compass size={20} />Un paso a la vez, a tu ritmo.</span>
          </div>
        </aside>}
        <section className="auth-main" aria-labelledby="auth-title">
          <div className="auth-heading">
            {admin && <span className="icon-tile"><ShieldCheck size={24} /></span>}
            <span className="auth-kicker">{admin ? 'ACCESO RESTRINGIDO' : register ? 'EMPIEZA TU RUTA' : reset ? 'RECUPERA TU CUENTA' : 'CONTINÚA TU RUTA'}</span>
            <h1 id="auth-title">{admin ? 'Acceso a administración' : register ? 'Crea tu cuenta' : reset ? 'Recupera tu acceso' : 'Te damos la bienvenida'}</h1>
            <p>{admin ? 'Ingresa con tus credenciales de administración.' : register ? 'Para personas de 18 años o más que buscan su primera carrera universitaria.' : reset ? 'Te enviaremos instrucciones a tu correo.' : 'Ingresa y retoma donde lo dejaste.'}</p>
          </div>
          {process.env.NEXT_PUBLIC_DESIGN_PREVIEW==='true'&&!admin&&<p className="auth-test-note">Prueba de diseño: usa datos ficticios. Tu cuenta se conserva solo en esta pestaña; no se crea una cuenta en el servidor.</p>}{form}
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
