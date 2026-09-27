import type { User } from "../types";
export const initialUsers: User[] = [
  {
    id: "u1",
    name: "María López",
    email: "maria.lopez@example.com",
    role: "Estudiante",
    group: "3.º Bachillerato A",
    status: "Activo",
  },
  {
    id: "u2",
    name: "Diego Torres",
    email: "diego.torres@example.com",
    role: "Estudiante",
    group: "3.º Bachillerato A",
    status: "Activo",
  },
  {
    id: "u3",
    name: "Valentina Ruiz",
    email: "valentina.ruiz@example.com",
    role: "Estudiante",
    group: "3.º Bachillerato B",
    status: "Invitación pendiente",
  },
  {
    id: "u4",
    name: "Mateo Castro",
    email: "mateo.castro@example.com",
    role: "Estudiante",
    group: "3.º Bachillerato B",
    status: "Activo",
  },
  {
    id: "u5",
    name: "Sofía Almeida",
    email: "sofia.almeida@example.com",
    role: "Estudiante",
    group: "Graduados",
    status: "Activo",
  },
  {
    id: "u6",
    name: "Lucas Rivera",
    email: "lucas.rivera@example.com",
    role: "Estudiante",
    group: "Graduados",
    status: "Suspendido",
  },
  {
    id: "u7",
    name: "Ana Ruiz",
    email: "ana.ruiz@example.com",
    role: "Orientador",
    group: "Equipo de orientación",
    status: "Activo",
  },
  {
    id: "u8",
    name: "Paula Mora",
    email: "paula.mora@example.com",
    role: "Orientador",
    group: "Equipo de orientación",
    status: "Activo",
  },
];
export const isUsers = (x: unknown): x is User[] =>
  Array.isArray(x) &&
  x.every(
    (v) =>
      v &&
      typeof v.id === "string" &&
      typeof v.name === "string" &&
      typeof v.email === "string" &&
      typeof v.group === "string" &&
      ["Estudiante", "Orientador"].includes(v.role) &&
      ["Activo", "Invitación pendiente", "Suspendido"].includes(v.status),
  );
