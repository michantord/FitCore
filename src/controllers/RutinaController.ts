import type { Ejercicio, Nivel, RutinaEjercicio } from '../models/types';

export function calcularNivel(
  frecuenciaSemanal: number,
  ejercicios: (RutinaEjercicio & { ejercicio?: Ejercicio })[]
): Nivel {
  if (ejercicios.length === 0) return 'Principiante';

  const dificultades = ejercicios
    .map((re) => re.ejercicio?.dificultad)
    .filter(Boolean) as string[];

  const conteo = dificultades.reduce<Record<string, number>>((acc, d) => {
    acc[d] = (acc[d] ?? 0) + 1;
    return acc;
  }, {});

  const dominante = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'medio';

  if (frecuenciaSemanal >= 5 && dominante === 'alto') return 'Avanzado';
  if (frecuenciaSemanal <= 2 && dominante === 'basico') return 'Principiante';
  return 'Intermedio';
}

export function estaCompleta(
  ejercicios: RutinaEjercicio[]
): boolean {
  return ejercicios.length >= 3;
}
