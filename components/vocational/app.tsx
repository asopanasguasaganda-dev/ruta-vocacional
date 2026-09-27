"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Compass,
  Eye,
  EyeOff,
  GraduationCap,
  LogOut,
  Map,
  Menu,
  Play,
  ShieldCheck,
  Target,
  UserRound,
  X,
} from "lucide-react";
import { navigation, assessments } from "./data";
import { StudentPage } from "./student";
import { AssessmentPage, Laboratory } from "./assessments";
import { AdminPage } from "./admin";

export type RouteData = {
  name: string;
  email: string;
  school: string;
  grade: string;
  answers: Record<string, number[]>;
  favorites: string[];
  savedResources: string[];
  reflections: Record<string, string>;
  tasks: { id: string; title: string; date: string; done: boolean }[];
  lab: Record<string, number>;
};
const initial: RouteData = {
  name: "",
  email: "",
  school: "",
  grade: "",
  answers: {},
  favorites: [],
  savedResources: [],
  reflections: {},
  tasks: [],
  lab: {},
};
type Context = {
  data: RouteData;
  update: (change: Partial<RouteData>) => void;
  notify: (text: string) => void;
};
const RouteContext = createContext<Context>({
  data: initial,
  update: () => {},
  notify: () => {},
});
export const useRouteData = () => useContext(RouteContext);
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Ruta Vocacional 360, inicio">
      <img
        src="/assets/brand.webp"
        alt="Ruta Vocacional 360° — Orientación académica y profesional"
        width="355"
        height="58"
      />
    </Link>
  );
}
export function ButtonLink({
  href,
  children,
  variant = "",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={`btn ${variant} ${className}`}>
      {children}
    </Link>
  );
}
export function Progress({ value }: { value: number }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label="Progreso"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
export function PageTitle({
  before,
  accent,
  description,
}: {
  before: string;
  accent?: string;
  description: string;
}) {
  return (
    <div className="page-title">
      <h1>
        {before} <em>{accent}</em>
      </h1>
      <p>{description}</p>
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const dialog = document.querySelector<HTMLDialogElement>("dialog");
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      className="modal"
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-heading">
        <h2>{title}</h2>
        <button className="icon-btn" aria-label="Cerrar" onClick={onClose}>
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function VocationalApp() {
  const path = usePathname();
  const [data, setData] = useState<RouteData>(initial);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");
  const [menu, setMenu] = useState(false);
  const [help, setHelp] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ruta360.v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
          setData({ ...initial, ...parsed });
      }
    } catch {
      setToast("No se pudo recuperar el avance guardado.");
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("ruta360.v3", JSON.stringify(data));
    } catch {
      setToast(
        "El navegador no permite guardar el avance. Puedes descargar tu informe.",
      );
    }
  }, [data, ready]);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  useEffect(() => {
    setMenu(false);
    setHelp(false);
  }, [path]);
  const update = (change: Partial<RouteData>) =>
    setData((current) => ({ ...current, ...change }));
  const isAuth = ["/ingresar", "/registro", "/admin/ingresar"].includes(path);
  const isAdmin = path.startsWith("/admin") && !isAuth;
  const isQuiz = path.startsWith("/evaluacion/");
  const isStudent = path.startsWith("/mi-ruta");
  const initials = (data.name || "Mi ruta")
    .split(" ")
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
  return (
    <RouteContext.Provider value={{ data, update, notify: setToast }}>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      {path === "/" ? (
        <PublicHome />
      ) : isAuth ? (
        <AuthPage key={`${path}-${ready}`} mode={path} />
      ) : (
        <>
          <header className="app-header">
            <div className="header-brand">
              {!isQuiz && (
                <button
                  className="icon-btn mobile-menu"
                  aria-label="Abrir menú"
                  aria-expanded={menu}
                  onClick={() => setMenu(!menu)}
                >
                  <Menu />
                </button>
              )}
              <Brand />
            </div>
            <div className="header-tools">
              {isQuiz ? (
                <Link href="/mi-ruta/evaluaciones">
                  <LogOut size={17} /> Guardar y salir
                </Link>
              ) : (
                <span>{isAdmin ? "Administración · Demo" : "Mi espacio"}</span>
              )}
              <button
                className="icon-btn help-button"
                aria-label="Ayuda"
                onClick={() => setHelp(true)}
              >
                <CircleHelp />
              </button>
              <span className="header-divider" />
              <Link
                className="profile-link"
                href={isAdmin ? "/admin/configuracion" : "/mi-ruta/perfil"}
              >
                <span className="avatar">{isAdmin ? "AD" : initials}</span>
                <ChevronDown size={16} />
              </Link>
            </div>
          </header>
          {isQuiz ? (
            <main id="contenido" className="quiz-main">
              <AssessmentPage
                key={`${path}-${ready}`}
                kind={path.split("/").pop()!}
              />
            </main>
          ) : isAdmin ? (
            <AdminPage path={path} menu={menu} />
          ) : (
            <div className="workspace">
              <aside className={`sidebar ${menu ? "open" : ""}`}>
                <nav aria-label="Mi espacio">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      className={
                        path === item.href ||
                        (item.href === "/mi-ruta/evaluaciones" &&
                          path.includes("laboratorio"))
                          ? "active"
                          : ""
                      }
                      href={item.href}
                    >
                      <item.icon />
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="sidebar-bottom">
                  <Link
                    className={path === "/mi-ruta/perfil" ? "active" : ""}
                    href="/mi-ruta/perfil"
                  >
                    <UserRound />
                    Mi perfil
                  </Link>
                  <Link href="/">
                    <LogOut />
                    Salir al inicio
                  </Link>
                </div>
                <div className="sidebar-note">
                  <ShieldCheck size={18} />
                  <span>
                    Tu futuro, a tu ritmo.
                    <small>Avance guardado en este dispositivo</small>
                  </span>
                </div>
              </aside>
              <main id="contenido" className="workspace-content">
                {isStudent &&
                  (path === "/mi-ruta/laboratorio" ? (
                    <Laboratory />
                  ) : (
                    <StudentPage key={`${path}-${ready}`} path={path} />
                  ))}
              </main>
            </div>
          )}
        </>
      )}
      {help && (
        <Modal
          title="Estamos contigo en esta ruta"
          onClose={() => setHelp(false)}
        >
          <p>
            Comienza por tus intereses, descubre tus valores y explora distintas
            carreras. Puedes pausar cualquier cuestionario y retomarlo desde
            Evaluaciones.
          </p>
          <div className="notice">
            <ShieldCheck />
            <p>
              Tu avance se guarda en este navegador. Esta versión funciona como
              una experiencia local; no crea cuentas en un servidor.
            </p>
          </div>
          <ButtonLink href="/mi-ruta/recursos">
            Explorar los recursos <ArrowRight />
          </ButtonLink>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
          <button onClick={() => setToast("")} aria-label="Cerrar aviso">
            <X size={16} />
          </button>
        </div>
      )}
    </RouteContext.Provider>
  );
}

function PublicHome() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="public-header">
        <Brand />
        <button
          className="icon-btn mobile-menu"
          aria-label="Abrir navegación"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <Menu />
        </button>
        <nav className={open ? "visible" : ""}>
          <a href="#como-funciona" onClick={() => setOpen(false)}>
            Cómo funciona
          </a>
          <a href="#estudiantes" onClick={() => setOpen(false)}>
            Para estudiantes
          </a>
          <a href="#instituciones" onClick={() => setOpen(false)}>
            Para instituciones
          </a>
          <Link href="/mi-ruta/recursos">Recursos</Link>
        </nav>
        <div className="header-actions">
          <Link className="login-link" href="/ingresar">
            Ingresar
          </Link>
          <ButtonLink href="/registro">
            Comenzar <ArrowRight size={19} />
          </ButtonLink>
        </div>
      </header>
      <main id="contenido" className="public-main">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Orientación académica y profesional</span>
            <h1>
              Conócete. <em>Explora.</em>
              <br />
              Elige tu camino.
            </h1>
            <p>
              Descubre tus intereses y explora carreras con una ruta guiada, a
              tu ritmo.
            </p>
            <div className="hero-actions">
              <ButtonLink href="/registro">
                Crear mi cuenta <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/mi-ruta" variant="outline">
                <Play size={20} />
                Ver cómo funciona
              </ButtonLink>
            </div>
          </div>
          <div className="hero-photo">
            <img
              src="/assets/students.webp"
              alt="Tres estudiantes exploran sus opciones de futuro juntos en la biblioteca"
              width="793"
              height="340"
            />
            <Link href="/registro" className="photo-note">
              <span className="round-icon">
                <GraduationCap />
              </span>
              <strong>
                Tu próxima etapa
                <br />
                <em>empieza contigo</em>
              </strong>
              <ArrowRight />
            </Link>
          </div>
        </section>
        <section className="steps-strip" id="como-funciona">
          {[
            {
              icon: UserRound,
              title: "Conoce tus intereses",
              text: "Descubre qué te motiva y en qué áreas disfrutas más.",
            },
            {
              icon: Compass,
              title: "Explora tus opciones",
              text: "Conoce carreras y áreas de estudio que se alinean contigo.",
            },
            {
              icon: Map,
              title: "Construye tu plan",
              text: "Traza tu ruta con reflexiones y próximos pasos.",
            },
          ].map((s, i) => (
            <div key={s.title}>
              <span className="step-number">0{i + 1}</span>
              <s.icon className="step-icon" />
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </div>
          ))}
        </section>
        <section className="public-section" id="estudiantes">
          <h2>Una ruta, diferentes formas de conocerte</h2>
          <p className="section-description">
            Combina herramientas para descubrir lo que te apasiona y tomar
            decisiones informadas.
          </p>
          <div className="public-cards">
            {assessments.slice(0, 3).map((a, i) => (
              <Link href={a.href} className="feature-card" key={a.id}>
                <span className={`tile-icon tone-${i}`}>
                  <a.icon />
                </span>
                <div>
                  <h3>{a.short}</h3>
                  <p>{a.description}</p>
                </div>
                <ArrowRight size={18} />
              </Link>
            ))}
          </div>
        </section>
        <section className="institution-section" id="instituciones">
          <div>
            <span className="eyebrow">Para instituciones</span>
            <h2>Acompaña cada camino.</h2>
            <p>
              Un espacio para organizar grupos, revisar el avance y acompañar
              las decisiones de tus estudiantes.
            </p>
            <ButtonLink href="/admin/ingresar">
              Acceso institucional <ArrowRight />
            </ButtonLink>
          </div>
          <div className="institution-visual">
            <GraduationCap size={48} />
            <h3>Más claridad para orientar.</h3>
            <div>
              <Check /> Seguimiento por estudiante
            </div>
            <div>
              <Check /> Evaluaciones y resultados
            </div>
            <div>
              <Check /> Grupos y reportes
            </div>
          </div>
        </section>
        <section className="last-cta">
          <div>
            <h2>No necesitas tener todas las respuestas.</h2>
            <p>Solo dar el primer paso para conocerte mejor.</p>
          </div>
          <ButtonLink href="/registro">
            Comenzar mi ruta <ArrowRight />
          </ButtonLink>
        </section>
      </main>
      <footer className="public-footer">
        <Brand />
        <p>Tu futuro se construye paso a paso.</p>
        <Link href="/admin/ingresar">Acceso de administración</Link>
      </footer>
    </>
  );
}

function AuthPage({ mode }: { mode: string }) {
  const router = useRouter();
  const { data, update, notify } = useRouteData();
  const register = mode === "/registro",
    admin = mode === "/admin/ingresar";
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: data.name,
    email: data.email,
    school: data.school,
    grade: data.grade,
    password: "",
    surname: "",
  });
  const [terms, setTerms] = useState(false);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (register && step === 1) {
      setStep(2);
      return;
    }
    if (register && step === 2) {
      setStep(3);
      return;
    }
    update({
      name: register
        ? `${form.name} ${form.surname}`.trim()
        : data.name || form.email.split("@")[0],
      email: form.email,
      school: form.school,
      grade: form.grade,
    });
    notify(
      admin
        ? "Vista de administración de demostración."
        : "Tu espacio local está listo.",
    );
    router.push(admin ? "/admin" : "/mi-ruta");
  };
  return (
    <div
      className={`auth-page ${register ? "register-page" : ""} ${admin ? "admin-auth" : ""}`}
    >
      <header className="auth-header">
        <Brand />
        <Link href="/">
          {" "}
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
      </header>
      {!register && !admin && (
        <aside className="auth-art">
          <div>
            <h1>
              Tu futuro
              <br />
              empieza por
              <br />
              <em>conocerte.</em>
            </h1>
            <p>
              Retoma tu ruta y descubre
              <br />
              nuevas posibilidades.
            </p>
            <div className="auth-pillars">
              <span>
                <UserRound />
                Conócete
              </span>
              <span>
                <Compass />
                Explora
              </span>
              <span>
                <Map />
                Decide
              </span>
            </div>
          </div>
          <img
            src="/assets/students.webp"
            alt="Estudiantes descubriendo nuevas posibilidades"
          />
        </aside>
      )}
      <main id="contenido" className="auth-main">
        <div className="auth-card">
          {register && (
            <div className="registration-steps">
              {["Tu cuenta", "Tu perfil", "Comenzar"].map((s, i) => (
                <span className={step >= i + 1 ? "active" : ""} key={s}>
                  <b>{i + 1}</b>
                  {s}
                </span>
              ))}
            </div>
          )}
          {admin && (
            <span className="tile-icon">
              <ShieldCheck />
            </span>
          )}
          <h1>
            {register ? (
              step === 1 ? (
                <>
                  Crea tu cuenta y <em>empieza tu ruta.</em>
                </>
              ) : step === 2 ? (
                <>
                  Cuéntanos <em>sobre ti.</em>
                </>
              ) : (
                <>
                  Todo listo para <em>comenzar.</em>
                </>
              )
            ) : admin ? (
              "Acceso de administración"
            ) : (
              "Te damos la bienvenida"
            )}
          </h1>
          <p>
            {register
              ? "Un espacio para explorar tus posibilidades a tu ritmo."
              : admin
                ? "Ingresa con tu cuenta institucional."
                : "Ingresa para continuar tu ruta vocacional."}
          </p>
          <form onSubmit={submit}>
            {register && step === 1 && (
              <div className="form-row">
                <label>
                  Nombre
                  <input
                    required
                    autoComplete="given-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Tu nombre"
                  />
                </label>
                <label>
                  Apellido
                  <input
                    required
                    autoComplete="family-name"
                    value={form.surname}
                    onChange={(e) =>
                      setForm({ ...form, surname: e.target.value })
                    }
                    placeholder="Tu apellido"
                  />
                </label>
              </div>
            )}
            {(!register || step === 1) && (
              <>
                <label>
                  {admin ? "Correo institucional" : "Correo electrónico"}
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="nombre@correo.com"
                  />
                </label>
                <label>
                  Contraseña
                  <div className="password-field">
                    <input
                      type={show ? "text" : "password"}
                      minLength={8}
                      required
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      autoComplete={
                        register ? "new-password" : "current-password"
                      }
                      placeholder="Al menos 8 caracteres"
                    />
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={
                        show ? "Ocultar contraseña" : "Mostrar contraseña"
                      }
                      onClick={() => setShow(!show)}
                    >
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
              </>
            )}
            {register && step === 2 && (
              <>
                <label>
                  Institución educativa
                  <input
                    value={form.school}
                    onChange={(e) =>
                      setForm({ ...form, school: e.target.value })
                    }
                    placeholder="Nombre de tu colegio (opcional)"
                  />
                </label>
                <label>
                  ¿En qué etapa estás?
                  <select
                    required
                    value={form.grade}
                    onChange={(e) =>
                      setForm({ ...form, grade: e.target.value })
                    }
                  >
                    <option value="">Selecciona una opción</option>
                    <option>Últimos años de secundaria</option>
                    <option>Bachillerato</option>
                    <option>Explorando después del colegio</option>
                    <option>Quiero cambiar de carrera</option>
                  </select>
                </label>
              </>
            )}
            {register && step === 3 && (
              <>
                <div className="registration-summary">
                  <Check />
                  <h3>¡Bienvenido/a, {form.name}!</h3>
                  <p>
                    Comienza con tus intereses y guarda cada descubrimiento en
                    tu espacio.
                  </p>
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    required
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                  />
                  Entiendo que mi perfil y avance se guardan en este
                  dispositivo.
                </label>
              </>
            )}
            <div className="local-disclaimer">
              <ShieldCheck size={16} />
              <span>
                Versión local de demostración. No se envían credenciales ni se
                crea una cuenta en línea.
              </span>
            </div>
            <button className="btn full" type="submit">
              {register
                ? step === 3
                  ? "Comenzar mi ruta"
                  : "Continuar"
                : admin
                  ? "Ingresar al panel de ejemplo"
                  : "Ingresar a mi espacio"}
              <ArrowRight size={18} />
            </button>
            {register && step > 1 && (
              <button
                type="button"
                className="btn ghost full"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft size={16} />
                Anterior
              </button>
            )}
          </form>
          {!admin && (
            <div className="auth-switch">
              {register
                ? "¿Ya tienes un espacio?"
                : "¿Aún no tienes un espacio?"}
              <Link href={register ? "/ingresar" : "/registro"}>
                {register ? "Ingresar" : "Crear cuenta"}
              </Link>
            </div>
          )}
          <Link className="demo-link" href={admin ? "/admin" : "/mi-ruta"}>
            Explorar la demostración sin registro <ArrowRight size={15} />
          </Link>
        </div>
        {register && (
          <aside className="register-aside">
            <h2>
              Toda tu ruta,
              <br />
              en un solo lugar.
            </h2>
            <p>Avanza a tu ritmo y descubre nuevas posibilidades.</p>
            {[
              {
                icon: BookOpen,
                title: "Guarda tu progreso",
                text: "Retoma tus actividades cuando quieras.",
              },
              {
                icon: Compass,
                title: "Explora alternativas",
                text: "Conecta tus intereses con carreras.",
              },
              {
                icon: Map,
                title: "Construye tu plan",
                text: "Transforma tus ideas en próximos pasos.",
              },
            ].map((x) => (
              <div key={x.title}>
                <span className="tile-icon">
                  <x.icon />
                </span>
                <div>
                  <h3>{x.title}</h3>
                  <p>{x.text}</p>
                </div>
              </div>
            ))}
          </aside>
        )}
      </main>
    </div>
  );
}
