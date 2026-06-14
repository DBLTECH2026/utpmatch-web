/** Tipos del dominio UTP+Match (espejo de las API Resources del backend). */

export type Rol = "alumno" | "asesor" | "admin";

export interface Career {
  carrera: string;
  roles: string[];
}

export interface Skill {
  id: number;
  nombre: string;
  categoria: "tecnica" | "blanda";
  nivel?: number;
  origen?: string;
  verificado?: boolean;
}

export interface Profile {
  id: number;
  rol_objetivo: string | null;
  headline: string | null;
  about: string | null;
  empleabilidad_score: number;
  skills?: Skill[];
  updated_at?: string;
}

export interface Connection {
  provider: string;
  status: string;
  last_sync_at: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  codigo_utp: string | null;
  carrera: string | null;
  ciclo: number | null;
  rol: Rol;
  profile?: Profile;
  connections?: Connection[];
}

// --- Dominios adicionales ---

export interface RoutePaso {
  orden: number;
  skill: string;
  demanda_pct: number;
  estado: "pendiente" | "en_curso" | "completado";
  taller: string | null;
}

export interface RouteData {
  rol_objetivo: string;
  match_actual: number;
  match_meta: number;
  pasos: RoutePaso[];
}

export interface GapsData {
  tiene: { skill_id: number; nombre: string; demanda_pct: number }[];
  falta: { skill_id: number; nombre: string; demanda_pct: number }[];
  match_actual: number;
}

export interface DashboardData {
  usuario: string;
  rol_objetivo: string;
  score: number;
  match_actual: number;
  match_meta: number;
  brechas: number;
  vacantes: number;
  ruta: RoutePaso[];
  nudge: { mensaje: string; cta_label: string | null; cta_route: string | null } | null;
}

export interface VacancyItem {
  id: number;
  titulo: string;
  empresa: string;
  ubicacion: string | null;
  modalidad: string | null;
  match_pct: number;
  faltantes: string[];
}

export interface VacancyDetail extends VacancyItem {
  salario: string | null;
  cumple: string[];
}

export interface AdvisorItem {
  id: number;
  nombre: string;
  especialidad: string | null;
  empresa: string | null;
  rating: number;
}

export interface Nudge {
  id: number;
  tipo: string;
  mensaje: string;
  cta_label: string | null;
  cta_route: string | null;
}

export interface CvData {
  id: number;
  rol_objetivo: string;
  plantilla: string;
  json_data: Record<string, unknown>;
  ats_score: number;
  sugerencias: { punto: string; taller: string }[] | null;
  version: number;
}
