import { CompositeSpecification } from '../patterns/Specification';
import type { Ejercicio, Nivel } from '../../models/types';

/**
 * Specifications concretas sobre Ejercicio.
 * Cada una es una regla de filtrado independiente (SRP) y se puede combinar
 * con las demás mediante .and() / .or() / .not() sin tocar este archivo.
 */

/** El ejercicio está disponible (no bloqueado por el admin). */
export class EjercicioActivoSpec extends CompositeSpecification<Ejercicio> {
  isSatisfiedBy(e: Ejercicio): boolean {
    return e.activo;
  }
}

/** El ejercicio está recomendado para un nivel concreto. */
export class NivelRecomendadoSpec extends CompositeSpecification<Ejercicio> {
  private readonly nivel: Nivel;
  constructor(nivel: Nivel) {
    super();
    this.nivel = nivel;
  }
  isSatisfiedBy(e: Ejercicio): boolean {
    return e.nivel_recomendado === this.nivel;
  }
}

/** El ejercicio pertenece a un grupo muscular dado (extensibilidad: OCP). */
export class GrupoMuscularSpec extends CompositeSpecification<Ejercicio> {
  private readonly grupo: string;
  constructor(grupo: string) {
    super();
    this.grupo = grupo;
  }
  isSatisfiedBy(e: Ejercicio): boolean {
    return e.grupo_muscular === this.grupo;
  }
}
