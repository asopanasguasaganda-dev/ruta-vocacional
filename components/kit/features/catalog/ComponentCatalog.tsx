import { useState } from "react";
import {
  ArrowRight,
  Brain,
  Check,
  Download,
  Heart,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import type { Navigate } from "../../types";
import { views } from "../../data/navigation";
import { careers } from "../../data/careers";
import { resources } from "../../data/resources";
import { initialUsers } from "../../data/admin";
import { interestOptions } from "../../data/instruments";
import {
  ActionLink,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Field,
  IconButton,
  MetricCard,
  Notice,
  PageHeader,
  Progress,
  SectionTitle,
  SelectField,
  Stepper,
  Tabs,
  TextareaField,
} from "../../components/ui/primitives";
import { Brand } from "../../components/layout/Brand";
import { Dialog } from "../../components/ui/Dialog";
import { useToast } from "../../components/ui/Toast";
import { AssessmentCard } from "../../components/domain/AssessmentCard";
import { CareerCard } from "../../components/domain/CareerCard";
import { AnswerOptions } from "../../components/domain/Questionnaire";
import { ProfileChart, ScoreList } from "../../components/domain/ProfileChart";
import { UserTable } from "../../components/domain/UserTable";
import { ResourceCard } from "../student/Resources";
import { StationNavigation } from "../student/Plan";
const colors = [
  { name: "Azul académico", hex: "#172A4A", token: "--ink" },
  { name: "Violeta principal", hex: "#5B4BDB", token: "--primary" },
  { name: "Verde orientación", hex: "#0F766E", token: "--teal" },
  { name: "Fondo general", hex: "#F5F7FB", token: "--canvas" },
  { name: "Lavanda suave", hex: "#EEEAFE", token: "--primary-soft" },
  { name: "Bordes", hex: "#D9E1ED", token: "--border" },
];
const demoScores = [
  { code: "R", name: "Realista", value: 2.6 },
  { code: "I", name: "Investigador", value: 4.6 },
  { code: "A", name: "Artístico", value: 3.2 },
  { code: "S", name: "Social", value: 4.2 },
  { code: "E", name: "Emprendedor", value: 3.4 },
  { code: "C", name: "Convencional", value: 3.8 },
];
export function ComponentCatalog({ navigate }: { navigate: Navigate }) {
  const [tab, setTab] = useState("student");
  const [answer, setAnswer] = useState<number>(4);
  const [saved, setSaved] = useState(false);
  const [checked, setChecked] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [station, setStation] = useState(1);
  const toast = useToast();
  return (
    <main id="contenido" className="catalog-page">
      <button className="brand-button" onClick={() => navigate("inicio")}>
        <Brand />
      </button>
      <div className="catalog-layout">
        <header className="catalog-intro">
          <div>
            <p className="eyebrow">SISTEMA DE DISEÑO · V1.0</p>
            <h1 tabIndex={-1}>
              Una identidad.
              <br />
              Cada parte de tu proyecto.
            </h1>
            <p className="muted">
              Componentes editables para Ruta Vocacional 360°. Una base
              coherente para la web pública, el espacio del estudiante y la
              administración.
            </p>
            <div className="row" style={{ marginTop: 24 }}>
              <Button onClick={() => navigate("inicio")}>
                Recorrer la web <ArrowRight size={17} />
              </Button>
              <Button variant="secondary" onClick={() => navigate("mi-ruta")}>
                Ver el sistema
              </Button>
            </div>
          </div>
          <img
            src="/media/brain-book-icon.png"
            alt="Isotipo de cerebro y libro"
          />
        </header>
        <nav className="catalog-nav" aria-label="Secciones del catálogo">
          {[
            ["identidad", "Identidad"],
            ["controles", "Controles"],
            ["formularios", "Formularios"],
            ["navegacion", "Navegación"],
            ["tarjetas", "Tarjetas"],
            ["evaluacion", "Tests y resultados"],
            ["tablas", "Administración"],
            ["estados", "Estados"],
            ["pantallas", "Todos los apartados"],
          ].map(([id, label]) => (
            <a key={id} href={"#" + id}>
              {label}
            </a>
          ))}
        </nav>
        <section className="catalog-section" id="identidad">
          <SectionTitle
            title="01 / Identidad y fundamentos"
            action={<Badge tone="primary">Tokens reutilizables</Badge>}
          />
          <div className="stack">
            <div className="grid grid-3">
              {colors.map((color) => (
                <div className="swatch" key={color.hex}>
                  <div
                    className="swatch-color"
                    style={{ background: color.hex }}
                  />
                  <div className="swatch-info">
                    <b>{color.name}</b>
                    <code>
                      {color.hex} · {color.token}
                    </code>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-2">
              <Card className="stack">
                <Brand />
                <div
                  style={{
                    background: "#172a4a",
                    padding: 20,
                    borderRadius: 12,
                  }}
                >
                  <Brand inverse />
                </div>
                <p className="component-label">
                  Brand · components/layout/Brand.tsx
                </p>
              </Card>
              <Card className="stack-sm">
                <p className="eyebrow">TIPOGRAFÍA ACADÉMICA</p>
                <p
                  style={{
                    fontSize: 32,
                    fontWeight: 750,
                    lineHeight: 1.2,
                    letterSpacing: -1,
                  }}
                >
                  Tu camino empieza aquí.
                </p>
                <h2>Títulos claros y cercanos</h2>
                <p>
                  Texto de lectura cómodo, con espacio para comprender y
                  decidir.
                </p>
                <p className="small muted">
                  Sistema sans serif · 32 / 21 / 17 / 16 / 13 px
                </p>
                <p className="component-label">
                  Espaciado 4 · 8 · 12 · 16 · 24 · 32 · 48 / Radio 10 · 16 · 24
                </p>
              </Card>
            </div>
          </div>
        </section>
        <section className="catalog-section" id="controles">
          <SectionTitle title="02 / Botones y controles" />
          <Card className="stack">
            <div className="row">
              <Button
                onClick={() => toast("Acción principal completada")}
                icon={<ArrowRight size={17} />}
              >
                Acción principal
              </Button>
              <Button
                variant="secondary"
                onClick={() => toast("Acción secundaria seleccionada")}
              >
                Secundario
              </Button>
              <Button
                variant="ghost"
                onClick={() => toast("Acción discreta seleccionada")}
              >
                Discreto
              </Button>
              <Button variant="danger" onClick={() => setDialog(true)}>
                Destructivo
              </Button>
            </div>
            <div className="row">
              <Button size="sm" onClick={() => toast("Control compacto")}>
                Compacto
              </Button>
              <Button disabled>Deshabilitado</Button>
              <Button loading>Guardando</Button>
              <IconButton
                label="Buscar"
                onClick={() => toast("Botón de búsqueda")}
              >
                <Search size={18} />
              </IconButton>
              <IconButton
                label="Configuración"
                onClick={() => navigate("ajustes")}
              >
                <Settings size={18} />
              </IconButton>
              <ActionLink onClick={() => navigate("carreras")}>
                Explorar carreras
              </ActionLink>
            </div>
            <div className="row">
              <Badge tone="primary">En progreso</Badge>
              <Badge tone="success">Completado</Badge>
              <Badge tone="warning">Pendiente</Badge>
              <Badge tone="danger">Suspendido</Badge>
              <Badge>Opcional</Badge>
              <Avatar name="María López" />
              <Avatar name="Ana Ruiz" small />
            </div>
            <p className="component-label">
              Button · IconButton · ActionLink · Badge · Avatar
            </p>
          </Card>
        </section>
        <section className="catalog-section" id="formularios">
          <SectionTitle title="03 / Formularios y validación" />
          <div className="grid grid-2">
            <Card className="stack">
              <Field
                label="Correo electrónico"
                type="email"
                placeholder="tu.nombre@example.com"
                hint="Usa datos de ejemplo para probar el formulario."
              />
              <Field
                label="Nombre y apellido"
                defaultValue="María"
                error="Escribe también tu apellido."
              />
              <SelectField label="Etapa educativa" defaultValue="bachillerato">
                <option value="bachillerato">Estudiante de bachillerato</option>
                <option value="graduado">Graduado/a del colegio</option>
              </SelectField>
              <Checkbox
                label="Quiero explorar las opciones que conectan conmigo."
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
              <p className="component-label">
                Field · SelectField · Checkbox · estados normal, error y ayuda
              </p>
            </Card>
            <Card className="stack">
              <TextareaField
                label="Una pregunta para mi futuro"
                placeholder="¿Qué te gustaría descubrir sobre una carrera?"
                rows={5}
                hint="Las reflexiones no tienen una respuesta correcta."
              />
              <Field
                label="Código de institución"
                defaultValue="DEMO-360"
                disabled
                hint="Ejemplo de un campo no editable."
              />
              <Button
                icon={<Check size={16} />}
                onClick={() => toast("Ejemplo de formulario confirmado")}
              >
                Guardar ejemplo
              </Button>
              <p className="component-label">
                TextareaField · Button · useToast
              </p>
            </Card>
          </div>
        </section>
        <section className="catalog-section" id="navegacion">
          <SectionTitle title="04 / Navegación y progreso" />
          <Card className="stack">
            <Tabs
              items={[
                { id: "student", label: "Estudiante" },
                { id: "admin", label: "Administrador" },
                { id: "public", label: "Web pública" },
              ]}
              value={tab}
              onChange={setTab}
            />
            <p className="muted small">
              {tab === "student"
                ? "Menú lateral claro: Mi ruta, Evaluaciones, Resultados y Mi plan."
                : tab === "admin"
                  ? "Menú institucional: Usuarios, Grupos, Evaluaciones y Reportes."
                  : "Navegación pública: Cómo funciona, Recursos, Ingresar y Comenzar."}
            </p>
            <Stepper
              labels={["Sobre ti", "Tu acceso", "Todo listo"]}
              current={1}
            />
            <Progress
              value={18}
              total={30}
              label="18 de 30 preguntas respondidas"
            />
            <p className="component-label">
              Tabs · Stepper · Progress · DemoToolbar · PublicHeader · AppShell
              · FocusShell
            </p>
          </Card>
        </section>
        <section className="catalog-section" id="tarjetas">
          <SectionTitle title="05 / Tarjetas del sistema" />
          <div className="stack">
            <div className="grid grid-3">
              <AssessmentCard
                title="Intereses vocacionales"
                description="Descubre las actividades que conectan contigo."
                icon={Brain}
                answered={18}
                total={30}
                duration="A tu ritmo"
                onStart={() => navigate("intereses")}
              />
              <CareerCard
                career={careers[0]}
                saved={saved}
                onSave={() => setSaved((v) => !v)}
                onOpen={() => navigate("carreras")}
              />
              <ResourceCard
                resource={resources[1]}
                saved={saved}
                onSave={() => setSaved((v) => !v)}
                onOpen={() => navigate("recursos")}
              />
            </div>
            <div className="grid grid-3">
              <MetricCard
                icon={<Brain />}
                label="Evaluaciones"
                value="2 / 3"
                note="Muestra visual"
              />
              <MetricCard
                icon={<Heart />}
                label="Carreras guardadas"
                value="4"
                note="Muestra visual"
              />
              <MetricCard
                icon={<Sparkles />}
                label="Estaciones completadas"
                value="3 / 8"
                note="Muestra visual"
              />
            </div>
            <p className="component-label">
              AssessmentCard · CareerCard · ResourceCard · MetricCard · Card
            </p>
          </div>
        </section>
        <section className="catalog-section" id="evaluacion">
          <SectionTitle title="06 / Tests, gráficos y plan" />
          <div className="stack">
            <Card className="stack">
              <Badge tone="primary">Ejemplo de pregunta · sin guardar</Badge>
              <h2>Investigar por qué ocurre un fenómeno.</h2>
              <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                <legend className="sr-only">Nivel de interés</legend>
                <AnswerOptions
                  options={interestOptions}
                  value={answer}
                  onChange={setAnswer}
                  name="catalog-example"
                />
              </fieldset>
              <p className="component-label">AnswerOptions · Questionnaire</p>
            </Card>
            <div className="grid grid-2 align-start">
              <Card>
                <SectionTitle
                  title="Perfil de intereses"
                  action={<Badge>Datos ilustrativos</Badge>}
                />
                <ProfileChart scores={demoScores} />
                <ScoreList scores={demoScores} />
                <p className="component-label">
                  ProfileChart · ScoreList / Escala de 1 a 5
                </p>
              </Card>
              <Card>
                <SectionTitle title="Estaciones del plan" />
                <StationNavigation
                  active={station}
                  completed={["0"]}
                  onChange={setStation}
                />
                <p className="component-label">
                  StationNavigation / Índice seleccionado: {station + 1}
                </p>
              </Card>
            </div>
          </div>
        </section>
        <section className="catalog-section" id="tablas">
          <SectionTitle title="07 / Tablas administrativas" />
          <UserTable
            users={initialUsers.slice(0, 3)}
            onEdit={() => navigate("usuarios")}
          />
          <p className="component-label">
            UserTable · UserForm · filtros · paginación · edición en Dialog ·
            exportación CSV
          </p>
        </section>
        <section className="catalog-section" id="estados">
          <SectionTitle title="08 / Estados y respuesta visual" />
          <div className="grid grid-2 align-start">
            <div className="stack">
              <Notice>
                Información: puedes guardar tu avance y continuar después.
              </Notice>
              <Notice tone="success">
                Éxito: tus cambios se guardaron correctamente.
              </Notice>
              <Notice tone="warning">
                Atención: revisa los campos pendientes.
              </Notice>
              <Notice tone="danger">
                Error: no se pudo completar la operación.
              </Notice>
              <Card className="stack-sm" aria-busy="true">
                <span className="sr-only">Ejemplo de carga</span>
                <div className="skeleton" style={{ width: "55%" }} />
                <div className="skeleton large" />
                <div className="skeleton" style={{ width: "80%" }} />
                <p className="component-label">Estado de carga / skeleton</p>
              </Card>
            </div>
            <div className="stack">
              <EmptyState
                title="Tu lista está por comenzar"
                description="Guarda una carrera para encontrarla aquí."
                action={
                  <Button onClick={() => navigate("carreras")}>
                    Explorar carreras
                  </Button>
                }
              />
              <Card className="row">
                <Button variant="secondary" onClick={() => setDialog(true)}>
                  Abrir diálogo
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => toast("Este es un aviso de confirmación")}
                >
                  Mostrar aviso
                </Button>
              </Card>
            </div>
          </div>
        </section>
        <section className="catalog-section" id="pantallas">
          <SectionTitle
            title="09 / Todos los apartados"
            action={
              <Badge tone="success">{views.length - 1} vistas navegables</Badge>
            }
          />
          <div className="grid grid-3">
            {views
              .filter((v) => v.id !== "catalogo")
              .map((view) => (
                <button
                  key={view.id}
                  className="screen-link"
                  onClick={() => navigate(view.id)}
                >
                  <span className="icon-tile">
                    <view.icon size={20} />
                  </span>
                  <span>
                    <strong>{view.label}</strong>
                    <small>{view.id}</small>
                  </span>
                  <ArrowRight size={16} />
                </button>
              ))}
          </div>
        </section>
        <Card className="row between">
          <div>
            <h3>Una base editable para desarrollar tu proyecto.</h3>
            <p className="small muted" style={{ marginTop: 6 }}>
              Consulta README.md y docs/ para componentes, rutas, datos e
              integración.
            </p>
          </div>
          <Button onClick={() => navigate("inicio")}>
            Comenzar recorrido <ArrowRight size={17} />
          </Button>
        </Card>
      </div>
      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        title="Un diálogo claro y enfocado"
      >
        <div className="stack">
          <p className="muted">
            Explica qué sucederá y deja una acción principal. Puedes cerrarlo
            con Escape, el botón de cierre o Cancelar.
          </p>
          <div className="row">
            <Button
              onClick={() => {
                setDialog(false);
                toast("Ejemplo confirmado");
              }}
            >
              Confirmar ejemplo
            </Button>
            <Button variant="secondary" onClick={() => setDialog(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Dialog>
    </main>
  );
}
