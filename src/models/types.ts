export interface Profile {
  id: string;
  nombre: string;
  rol: 'admin' | 'usuario';
  ultimo_acceso?: string;
  email?: string;
}

export interface Ejercicio {
  id: number;
  nombre: string;
  grupo_muscular: string;
  dificultad: 'basico' | 'medio' | 'alto';
  activo: boolean;
  nivel_recomendado: Nivel | null;
}

export type ExperienciaGym = 'nunca' | 'ocasional' | 'regular' | 'avanzado';
export type ActividadActual = 'sedentario' | 'activo' | 'muy_activo';
export type Objetivo = 'perder_peso' | 'ganar_musculo' | 'tonificar' | 'resistencia';

export interface PerfilFisico {
  usuario_id: string;
  experiencia: ExperienciaGym;
  actividad_actual: ActividadActual;
  objetivo: Objetivo;
  edad: number | null;
  peso_kg: number | null;
  altura_cm: number | null;
}

export interface Rutina {
  id: number;
  usuario_id: string;
  nombre: string;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado' | null;
  frecuencia_semanal: number;
  activa: boolean;
  fecha_modificacion?: string;
}

export interface RutinaEjercicio {
  rutina_id: number;
  ejercicio_id: number;
  series: number;
  repeticiones: number;
  ejercicio?: Ejercicio;
}

export interface RutinaConEjercicios extends Rutina {
  rutina_ejercicio: RutinaEjercicio[];
}

export type Nivel = 'Principiante' | 'Intermedio' | 'Avanzado';

