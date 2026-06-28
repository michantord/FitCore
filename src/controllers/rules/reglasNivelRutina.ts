import type { Regla } from '../patterns/Regla';
import type { Nivel } from '../../models/types';

/**
 * Contexto que evalúan las reglas de nivel de una rutina: la frecuencia
 * semanal y la dificultad dominante entre sus ejercicios.
 */
export interface ContextoRutina {
  frecuenciaSemanal: number;
  dificultadDominante: string;
}

/**
 * Reglas de clasificación del NIVEL DE LA RUTINA.
 * Reutilizan el mismo patrón Chain of Responsibility que las reglas de usuario
 * (mismo motor genérico `ejecutarCadena`), demostrando OCP y reutilización.
 */

/** Mucha frecuencia + ejercicios de alta dificultad => Avanzado. */
export class ReglaRutinaAvanzada implements Regla<ContextoRutina, Nivel> {
  evaluar(ctx: ContextoRutina): Nivel | null {
    if (ctx.frecuenciaSemanal >= 5 && ctx.dificultadDominante === 'alto') {
      return 'Avanzado';
    }
    return null;
  }
}

/** Poca frecuencia + ejercicios básicos => Principiante. */
export class ReglaRutinaPrincipiante implements Regla<ContextoRutina, Nivel> {
  evaluar(ctx: ContextoRutina): Nivel | null {
    if (ctx.frecuenciaSemanal <= 2 && ctx.dificultadDominante === 'basico') {
      return 'Principiante';
    }
    return null;
  }
}

/** Orden de evaluación. El default (Intermedio) lo aporta `ejecutarCadena`. */
export const REGLAS_NIVEL_RUTINA: Regla<ContextoRutina, Nivel>[] = [
  new ReglaRutinaAvanzada(),
  new ReglaRutinaPrincipiante(),
];
