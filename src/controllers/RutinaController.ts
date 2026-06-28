import type { Ejercicio, Nivel, RutinaEjercicio } from '../models/types';
import { ejecutarCadena } from './patterns/Regla';
import { REGLAS_NIVEL_RUTINA, type ContextoRutina } from './rules/reglasNivelRutina';

/** Número mínimo de ejercicios para considerar una rutina completa. */
const MIN_EJERCICIOS_RUTINA = 3;

/**
 * Obtiene la dificultad dominante (la más frecuente) entre los ejercicios.
 * Función pura y con responsabilidad única (SRP).
 */
function dificultadDominante(
  ejercicios: (RutinaEjercicio & { ejercicio?: Ejercicio })[]
): string {
  const conteo = ejercicios
    .map((re) => re.ejercicio?.dificultad)
    .filter(Boolean)
    .reduce<Record<string, number>>((acc, d) => {
      acc[d as string] = (acc[d as string] ?? 0) + 1;
      return acc;
    }, {});

  return Object.entries(conteo).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'medio';
}

/**
 * Calcula el nivel de la rutina. FACHADA que delega en la cadena de reglas
 * (Chain of Responsibility), reutilizando el mismo motor genérico que la
 * clasificación de usuarios. Para cambiar la política de niveles se editan las
 * reglas, no esta función.
 */
export function calcularNivel(
  frecuenciaSemanal: number,
  ejercicios: (RutinaEjercicio & { ejercicio?: Ejercicio })[]
): Nivel {
  if (ejercicios.length === 0) return 'Principiante';

  const contexto: ContextoRutina = {
    frecuenciaSemanal,
    dificultadDominante: dificultadDominante(ejercicios),
  };

  return ejecutarCadena<ContextoRutina, Nivel>(REGLAS_NIVEL_RUTINA, contexto, 'Intermedio');
}

/** Una rutina está completa si tiene al menos el mínimo de ejercicios. */
export function estaCompleta(ejercicios: RutinaEjercicio[]): boolean {
  return ejercicios.length >= MIN_EJERCICIOS_RUTINA;
}
