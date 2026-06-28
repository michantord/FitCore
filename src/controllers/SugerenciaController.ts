import type { Ejercicio, Nivel, PerfilFisico } from '../models/types';
import { ejecutarCadena } from './patterns/Regla';
import { REGLAS_NIVEL_USUARIO } from './rules/reglasNivelUsuario';
import { EjercicioActivoSpec, NivelRecomendadoSpec } from './specs/ejercicioSpecs';

/**
 * Controlador de sugerencias. Actúa como FACHADA: las vistas siguen llamando a
 * `clasificarUsuario` y `getSugerencias` con las mismas firmas, pero por dentro
 * delega en los patrones de diseño (Chain of Responsibility y Specification).
 */

/**
 * Clasifica el nivel del usuario aplicando la cadena de reglas (CoR).
 * Si ninguna regla aplica, el valor por defecto es 'Intermedio'.
 */
export function clasificarUsuario(perfil: PerfilFisico): Nivel {
  return ejecutarCadena<PerfilFisico, Nivel>(REGLAS_NIVEL_USUARIO, perfil, 'Intermedio');
}

/**
 * Sugiere ejercicios componiendo specifications:
 * "activo" AND "recomendado para el nivel del usuario".
 * Agregar otro criterio (p. ej. grupo muscular) es solo encadenar otra spec.
 */
export function getSugerencias(nivel: Nivel, ejercicios: Ejercicio[]): Ejercicio[] {
  const criterio = new EjercicioActivoSpec().and(new NivelRecomendadoSpec(nivel));
  return ejercicios.filter((e) => criterio.isSatisfiedBy(e));
}
