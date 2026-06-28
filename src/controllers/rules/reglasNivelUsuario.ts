import type { Regla } from '../patterns/Regla';
import type { Nivel, PerfilFisico } from '../../models/types';

/**
 * Reglas de clasificación del NIVEL DEL USUARIO a partir de su perfil físico.
 * Cada regla aplica una sola condición (SRP). El orden importa: las reglas más
 * específicas van primero y la cadena se detiene en la primera que aplica.
 */

/** Sin experiencia o sedentario => empieza como Principiante. */
export class ReglaPrincipiante implements Regla<PerfilFisico, Nivel> {
  evaluar(perfil: PerfilFisico): Nivel | null {
    if (perfil.experiencia === 'nunca' || perfil.actividad_actual === 'sedentario') {
      return 'Principiante';
    }
    return null;
  }
}

/** Experiencia avanzada y muy activo => Avanzado. */
export class ReglaAvanzado implements Regla<PerfilFisico, Nivel> {
  evaluar(perfil: PerfilFisico): Nivel | null {
    if (perfil.experiencia === 'avanzado' && perfil.actividad_actual === 'muy_activo') {
      return 'Avanzado';
    }
    return null;
  }
}

/**
 * Orden de la cadena. Para agregar/ajustar una clasificación se modifica este
 * arreglo o se crea una Regla nueva: el motor `ejecutarCadena` no cambia (OCP).
 * El valor por defecto (Intermedio) se aplica si ninguna regla aplica.
 */
export const REGLAS_NIVEL_USUARIO: Regla<PerfilFisico, Nivel>[] = [
  new ReglaPrincipiante(),
  new ReglaAvanzado(),
];
