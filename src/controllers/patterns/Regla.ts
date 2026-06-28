/**
 * PATRÓN DE DISEÑO: Chain of Responsibility (motor de reglas genérico)
 * --------------------------------------------------------------------------
 * Cada regla de negocio se evalúa en orden. La primera que "aplica" (devuelve
 * un resultado distinto de null) decide; si no aplica devuelve null y le pasa
 * la responsabilidad a la siguiente regla de la cadena.
 *
 * - SRP: cada Regla concreta encapsula UNA condición y nada más.
 * - OCP: para agregar una clasificación nueva se crea una Regla y se agrega al
 *        arreglo; no se modifica el motor ni las reglas existentes.
 * - DIP: `ejecutarCadena` depende de la abstracción `Regla<C, R>`, no de
 *        clases concretas. Las reglas se inyectan desde afuera.
 *
 * El motor es genérico (`<TContext, TResult>`), por eso se reutiliza tanto para
 * clasificar el nivel de un usuario como el nivel de una rutina.
 */

/** Abstracción de una regla. Devuelve un resultado o null si no le corresponde. */
export interface Regla<TContext, TResult> {
  evaluar(contexto: TContext): TResult | null;
}

/**
 * Recorre la cadena y devuelve el resultado de la primera regla que aplica.
 * Si ninguna aplica, usa el valor por defecto (garantiza un resultado total).
 */
export function ejecutarCadena<TContext, TResult>(
  reglas: Regla<TContext, TResult>[],
  contexto: TContext,
  porDefecto: TResult
): TResult {
  for (const regla of reglas) {
    const resultado = regla.evaluar(contexto);
    if (resultado !== null) return resultado;
  }
  return porDefecto;
}
