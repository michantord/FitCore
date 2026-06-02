import type { Ejercicio, Nivel, PerfilFisico } from '../models/types';

export function clasificarUsuario(perfil: PerfilFisico): Nivel {
  const { experiencia, actividad_actual } = perfil;

  if (experiencia === 'nunca' || actividad_actual === 'sedentario') {
    return 'Principiante';
  }
  if (experiencia === 'avanzado' && actividad_actual === 'muy_activo') {
    return 'Avanzado';
  }
  return 'Intermedio';
}

export function getSugerencias(nivel: Nivel, ejercicios: Ejercicio[]): Ejercicio[] {
  return ejercicios.filter(
    (e) => e.activo && e.nivel_recomendado === nivel
  );
}
