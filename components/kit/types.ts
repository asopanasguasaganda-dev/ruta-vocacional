import type { LucideIcon } from "lucide-react";
export type Tone = "primary" | "success" | "warning" | "danger" | "neutral";
export type View =
  | "admin-cuenta"
  | "admin-resultados"
  | "custom-test"
  | "reflexiones"
  | "catalogo"
  | "inicio"
  | "biblioteca"
  | "ingresar"
  | "registro"
  | "recuperar"
  | "admin-ingresar"
  | "mi-ruta"
  | "evaluaciones"
  | "intereses"
  | "valores"
  | "autoconocimiento"
  | "laboratorio"
  | "resultados"
  | "carreras"
  | "mi-plan"
  | "recursos"
  | "emprendimiento"
  | "mi-perfil"
  | "admin"
  | "usuarios"
  | "grupos"
  | "editor"
  | "contenidos"
  | "reportes"
  | "ajustes";
export interface NavItem {
  id: View;
  label: string;
  icon: LucideIcon;
}
export interface Option {
  value: number;
  label: string;
  description?: string;
}
export interface Question {
  required?: boolean;
  image?: string;
  imageAlt?: string;
  explanation?: string;
  correctValues?: number[];
  type?: 'single'|'multiple'|'likert'|'open';
  inverse?: boolean;
  weight?: number;
  source?: string;
  id: string;
  text: string;
  dimension?: string;
  options?: Option[];
}
export interface Instrument {
  due?: string;
  battery?: string;
  availableFrom?: string;
  estimatedMinutes?: number;
  resultPublication?: 'immediate'|'review';
  aggregation?: 'mean'|'sum';
  ranges?: {dimension:string;min:number;max:number;label:string}[];
  scoring?: 'manual'|'dimensions'|'objective';
  sourceId?: string;
  maxAttempts?: number;
  id: string;
  version: string;
  title: string;
  description: string;
  questions: Question[];
  options: Option[];
}
export interface Career {
  sourceUrl?: string;
  sourceDate?: string;
  id: string;
  name: string;
  area: string;
  interests: string[];
  description: string;
  activities: string;
  skills: string;
  investigate: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: "Estudiante" | "Orientador";
  group: string;
  status: "Activo" | "Invitación pendiente" | "Suspendido";
}
export type Navigate = (view: View) => void;
