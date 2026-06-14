/** Tipos del dominio UTP+Match (espejo de las API Resources del backend). */

export type Rol = "alumno" | "asesor" | "admin";

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
