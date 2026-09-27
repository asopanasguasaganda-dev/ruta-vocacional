"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  Check,
  ClipboardCheck,
  Download,
  Home,
  LogOut,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Target,
  Users,
  X,
} from "lucide-react";
import { Modal, PageTitle, Progress, useRouteData } from "./app";

type Student = {
  id: number;
  name: string;
  email: string;
  group: string;
  status: string;
  progress: number;
};
const exampleStudents: Student[] = [
  {
    id: 1,
    name: "María López",
    email: "maria.lopez@ejemplo.com",
    group: "3° Bachillerato A",
    status: "Activo",
    progress: 72,
  },
  {
    id: 2,
    name: "Diego Ruiz",
    email: "diego.ruiz@ejemplo.com",
    group: "3° Bachillerato B",
    status: "Activo",
    progress: 48,
  },
  {
    id: 3,
    name: "Valeria Cruz",
    email: "valeria.cruz@ejemplo.com",
    group: "2° Bachillerato A",
    status: "Activo",
    progress: 100,
  },
  {
    id: 4,
    name: "Andrés Pérez",
    email: "andres.perez@ejemplo.com",
    group: "3° Bachillerato A",
    status: "Pendiente",
    progress: 0,
  },
  {
    id: 5,
    name: "Camila Paz",
    email: "camila.paz@ejemplo.com",
    group: "2° Bachillerato A",
    status: "Activo",
    progress: 64,
  },
  {
    id: 6,
    name: "Lucas Torres",
    email: "lucas.torres@ejemplo.com",
    group: "3° Bachillerato B",
    status: "Activo",
    progress: 35,
  },
];
const adminNav = [
  { label: "Resumen", href: "/admin", icon: Home },
  { label: "Usuarios", href: "/admin/usuarios", icon: Users },
  { label: "Instituciones y grupos", href: "/admin/grupos", icon: BookOpen },
  { label: "Evaluaciones", href: "/admin/evaluaciones", icon: ClipboardCheck },
  {
    label: "Reportes",
    href: "/admin/reportes",
    icon: ChartNoAxesColumnIncreasing,
  },
  { label: "Configuración", href: "/admin/configuracion", icon: Settings },
];
export function AdminPage({ path, menu }: { path: string; menu: boolean }) {
  const { notify } = useRouteData();
  const [students, setStudents] = useState<Student[]>(exampleStudents),
    [loaded, setLoaded] = useState(false),
    [search, setSearch] = useState(""),
    [group, setGroup] = useState("Todos"),
    [status, setStatus] = useState("Todos"),
    [selected, setSelected] = useState<number[]>([]),
    [detail, setDetail] = useState<Student | null>(null),
    [adding, setAdding] = useState(false),
    [newUser, setNewUser] = useState({
      name: "",
      email: "",
      group: "3° Bachillerato A",
    });
  const [school, setSchool] = useState("Institución de ejemplo");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ruta360.admin-demo");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setStudents(parsed);
      }
      const name = localStorage.getItem("ruta360.school-demo");
      if (name) setSchool(name);
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem("ruta360.admin-demo", JSON.stringify(students));
      } catch {
        notify("No se pudo guardar el cambio local.");
      }
    }
  }, [students, loaded]);
  const groups = [...new Set(students.map((s) => s.group))];
  const filtered = students.filter(
    (s) =>
      `${s.name} ${s.email}`.toLowerCase().includes(search.toLowerCase()) &&
      (group === "Todos" || s.group === group) &&
      (status === "Todos" || s.status === status),
  );
  const exportCsv = () => {
    const rows = selected.length
      ? students.filter((s) => selected.includes(s.id))
      : students;
    const cell = (v: string | number) =>
      `"${String(v)
        .replace(/^[=+@-]/, "'$&")
        .replace(/"/g, '""')}"`;
    const csv =
      "\uFEFFNombre,Correo,Grupo,Estado,Progreso\n" +
      rows
        .map((s) =>
          [s.name, s.email, s.group, s.status, s.progress].map(cell).join(","),
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "ruta360-usuarios-demostracion.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify("Reporte de demostración descargado.");
  };
  const changeStatus = (student: Student) => {
    const next = {
      ...student,
      status: student.status === "Suspendido" ? "Activo" : "Suspendido",
    };
    setStudents(students.map((s) => (s.id === next.id ? next : s)));
    setDetail(next);
    notify("Estado actualizado en la demostración.");
  };
  const average = students.length
    ? Math.round(students.reduce((s, u) => s + u.progress, 0) / students.length)
    : 0;
  const stats = [
    { label: "Estudiantes", value: students.length, icon: Users },
    {
      label: "Estudiantes activos",
      value: students.filter((s) => s.status === "Activo").length,
      icon: ClipboardCheck,
    },
    { label: "Avance promedio", value: `${average}%`, icon: Target },
    { label: "Grupos activos", value: groups.length, icon: BookOpen },
  ];
  return (
    <div className="workspace admin-workspace">
      <aside className={`sidebar admin-sidebar ${menu ? "open" : ""}`}>
        <div className="admin-sidebar-title">
          <ShieldCheck />
          <span>
            Ruta Vocacional 360°<small>Panel de administración</small>
          </span>
        </div>
        <nav aria-label="Administración">
          {adminNav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={path === n.href ? "active" : ""}
            >
              <n.icon />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/">
            <LogOut />
            Volver al sitio
          </Link>
        </div>
        <div className="sidebar-note">
          <ShieldCheck />
          <span>
            Entorno de demostración<small>Datos de ejemplo</small>
          </span>
        </div>
      </aside>
      <main id="contenido" className="workspace-content admin-content">
        <div className="save-banner">
          <ShieldCheck size={19} />
          <span>
            Demostración institucional · Los estudiantes y registros son datos
            de ejemplo.
          </span>
        </div>
        {path === "/admin" && (
          <>
            <div className="title-with-action">
              <PageTitle
                before="Resumen general"
                description="Sigue el avance de estudiantes y grupos."
              />
              <button className="btn" onClick={exportCsv}>
                <Download size={17} />
                Exportar reporte
              </button>
            </div>
            <div className="admin-stats">
              {stats.map((s) => (
                <div className="panel stat" key={s.label}>
                  <span className="tile-icon">
                    <s.icon />
                  </span>
                  <div>
                    <p>{s.label}</p>
                    <strong>{s.value}</strong>
                  </div>
                </div>
              ))}
            </div>
            <div className="two-columns">
              <section className="panel">
                <div className="panel-heading">
                  <h2>Avance por grupo</h2>
                  <Link href="/admin/grupos">
                    Ver todos <ArrowRight size={14} />
                  </Link>
                </div>
                {groups.map((g) => {
                  const members = students.filter((s) => s.group === g);
                  const progress = Math.round(
                    members.reduce((s, u) => s + u.progress, 0) /
                      members.length,
                  );
                  return (
                    <div className="group-progress" key={g}>
                      <span>{g}</span>
                      <Progress value={progress} />
                      <strong>{progress}%</strong>
                    </div>
                  );
                })}
              </section>
              <section className="panel">
                <h2>Estado de las evaluaciones</h2>
                {[
                  {
                    title: "Ruta completada",
                    count: students.filter((s) => s.progress === 100).length,
                    text: "Estudiantes con todas las etapas de ejemplo.",
                  },
                  {
                    title: "En progreso",
                    count: students.filter(
                      (s) => s.progress > 0 && s.progress < 100,
                    ).length,
                    text: "Estudiantes que continúan explorando.",
                  },
                  {
                    title: "Pendientes de comenzar",
                    count: students.filter((s) => s.progress === 0).length,
                    text: "Una oportunidad para acompañar el primer paso.",
                  },
                ].map((r) => (
                  <div className="activity-row" key={r.title}>
                    <span className="round-icon small">{r.count}</span>
                    <div>
                      <h3>{r.title}</h3>
                      <p>{r.text}</p>
                    </div>
                  </div>
                ))}
              </section>
            </div>
            <section className="panel section-gap">
              <div className="panel-heading">
                <h2>Estudiantes que requieren seguimiento</h2>
                <Link href="/admin/usuarios">
                  Ver usuarios <ArrowRight size={14} />
                </Link>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Grupo</th>
                      <th>Progreso</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students
                      .filter((s) => s.progress < 50)
                      .map((s) => (
                        <tr key={s.id}>
                          <td>{s.name}</td>
                          <td>{s.group}</td>
                          <td>{s.progress}%</td>
                          <td>
                            <button
                              className="text-link"
                              onClick={() => setDetail(s)}
                            >
                              Ver perfil
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
        {path === "/admin/usuarios" && (
          <>
            <div className="title-with-action">
              <PageTitle
                before="Usuarios"
                description="Organiza cuentas, grupos y accesos."
              />
              <div className="header-actions">
                <button className="btn outline" onClick={exportCsv}>
                  <Download size={17} />
                  Exportar CSV
                </button>
                <button className="btn" onClick={() => setAdding(true)}>
                  <Plus size={18} />
                  Añadir usuario
                </button>
              </div>
            </div>
            <div className="filters">
              <label className="search-field">
                <Search size={19} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o correo"
                  aria-label="Buscar usuarios"
                />
              </label>
              <select
                aria-label="Filtrar grupo"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              >
                <option value="Todos">Todos los grupos</option>
                {groups.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
              <select
                aria-label="Filtrar estado"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Todos">Todos los estados</option>
                {["Activo", "Pendiente", "Suspendido"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <section className="panel">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          aria-label="Seleccionar todos los usuarios visibles"
                          checked={
                            filtered.length > 0 &&
                            filtered.every((s) => selected.includes(s.id))
                          }
                          onChange={(e) =>
                            setSelected(
                              e.target.checked ? filtered.map((s) => s.id) : [],
                            )
                          }
                        />
                      </th>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Grupo</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <input
                            type="checkbox"
                            aria-label={`Seleccionar ${s.name}`}
                            checked={selected.includes(s.id)}
                            onChange={() =>
                              setSelected(
                                selected.includes(s.id)
                                  ? selected.filter((i) => i !== s.id)
                                  : [...selected, s.id],
                              )
                            }
                          />
                        </td>
                        <td>
                          <strong>{s.name}</strong>
                        </td>
                        <td>{s.email}</td>
                        <td>
                          <span className="badge purple">Estudiante</span>
                        </td>
                        <td>{s.group}</td>
                        <td>
                          <span
                            className={`badge ${s.status === "Activo" ? "teal" : s.status === "Suspendido" ? "red" : "gold"}`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="text-link"
                            onClick={() => setDetail(s)}
                          >
                            Ver perfil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!filtered.length && (
                <p className="empty-small">
                  No hay usuarios con estos filtros.
                </p>
              )}
              <div className="table-footer">
                <span>
                  {filtered.length} usuarios · {selected.length} seleccionados
                </span>
                {selected.length > 0 && (
                  <button className="text-link" onClick={exportCsv}>
                    Exportar selección
                  </button>
                )}
              </div>
            </section>
          </>
        )}
        {path === "/admin/grupos" && (
          <>
            <PageTitle
              before="Instituciones y"
              accent="grupos"
              description="Una visión organizada de cada grupo de estudiantes."
            />
            <div className="three-columns">
              {groups.map((g) => {
                const members = students.filter((s) => s.group === g);
                return (
                  <section className="panel" key={g}>
                    <span className="tile-icon">
                      <Users />
                    </span>
                    <h2>{g}</h2>
                    <p>
                      {members.length} estudiantes · {school}
                    </p>
                    <Progress
                      value={Math.round(
                        members.reduce((s, u) => s + u.progress, 0) /
                          members.length,
                      )}
                    />
                    <ul className="group-members">
                      {members.map((s) => (
                        <li key={s.id}>
                          <button
                            className="text-link"
                            onClick={() => setDetail(s)}
                          >
                            {s.name}
                          </button>
                          <span>{s.progress}%</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          </>
        )}
        {path === "/admin/evaluaciones" && (
          <>
            <PageTitle
              before="Seguimiento de"
              accent="evaluaciones"
              description="Consulta el estado de las rutas de orientación."
            />
            <div className="panel table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Grupo</th>
                    <th>Avance de la ruta</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.group}</td>
                      <td>
                        <div className="table-progress">
                          <Progress value={s.progress} />
                          <span>{s.progress}%</span>
                        </div>
                      </td>
                      <td>
                        {s.progress === 100
                          ? "Completado"
                          : s.progress
                            ? "En curso"
                            : "Pendiente"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {path === "/admin/reportes" && (
          <>
            <PageTitle
              before="Reportes y"
              accent="seguimiento"
              description="Consulta y exporta la información de esta demostración."
            />
            <section className="panel report-panel">
              <span className="tile-icon large">
                <ChartNoAxesColumnIncreasing />
              </span>
              <h2>Reporte general de estudiantes</h2>
              <p>
                Incluye nombre, correo, grupo, estado y porcentaje de avance de
                los {students.length} registros de ejemplo.
              </p>
              <button className="btn" onClick={exportCsv}>
                <Download size={18} />
                Descargar reporte CSV
              </button>
            </section>
          </>
        )}
        {path === "/admin/configuracion" && (
          <>
            <PageTitle
              before="Configuración"
              description="Personaliza la información institucional de ejemplo."
            />
            <section className="panel profile-panel">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  try {
                    localStorage.setItem("ruta360.school-demo", school);
                    notify("Nombre institucional guardado.");
                  } catch {
                    notify("No fue posible guardar el nombre.");
                  }
                }}
              >
                <label>
                  Nombre de la institución
                  <input
                    required
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                  />
                </label>
                <button className="btn" type="submit">
                  Guardar cambios <Check size={18} />
                </button>
              </form>
              <div className="notice">
                <ShieldCheck />
                <p>
                  La administración es una vista local de demostración. Los
                  permisos y la autenticación institucional requieren un
                  servidor.
                </p>
              </div>
            </section>
          </>
        )}
      </main>
      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}>
          <span className="badge purple">Estudiante · Datos de ejemplo</span>
          <p>{detail.email}</p>
          <h3>Grupo</h3>
          <p>{detail.group}</p>
          <h3>Avance de su ruta · {detail.progress}%</h3>
          <Progress value={detail.progress} />
          <p>
            Estado: <strong>{detail.status}</strong>
          </p>
          <button
            className={`btn ${detail.status === "Suspendido" ? "" : "outline"}`}
            onClick={() => changeStatus(detail)}
          >
            {detail.status === "Suspendido"
              ? "Reactivar usuario de ejemplo"
              : "Suspender usuario de ejemplo"}
          </button>
        </Modal>
      )}
      {adding && (
        <Modal
          title="Añadir usuario de ejemplo"
          onClose={() => setAdding(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                students.some(
                  (s) => s.email.toLowerCase() === newUser.email.toLowerCase(),
                )
              ) {
                notify("Ese correo ya existe en la demostración.");
                return;
              }
              setStudents([
                ...students,
                {
                  ...newUser,
                  id: Date.now(),
                  status: "Pendiente",
                  progress: 0,
                },
              ]);
              setAdding(false);
              setNewUser({ name: "", email: "", group: "3° Bachillerato A" });
              notify(
                "Usuario añadido a la demostración. No se envió ninguna invitación.",
              );
            }}
          >
            <label>
              Nombre completo
              <input
                required
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
              />
            </label>
            <label>
              Correo electrónico
              <input
                type="email"
                required
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
            </label>
            <label>
              Grupo
              <input
                required
                value={newUser.group}
                onChange={(e) =>
                  setNewUser({ ...newUser, group: e.target.value })
                }
              />
            </label>
            <button className="btn full" type="submit">
              Añadir a la demostración <Plus size={18} />
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
