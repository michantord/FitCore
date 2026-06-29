# FitCore 🏋️

Aplicación web para crear y gestionar rutinas de gimnasio. Cada usuario arma sus
rutinas, completa un perfil físico opcional y el sistema le **sugiere ejercicios**
y le **calcula el nivel** (Principiante / Intermedio / Avanzado) según reglas de
negocio. Incluye un panel de administración para gestionar el catálogo de
ejercicios y ver a todos los usuarios.

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Supabase (PostgreSQL + Auth).

---

## Mejoras del Core: SOLID + Patrones de Diseño

El **core** del proyecto vive en `src/controllers/`:

- **Calcular el nivel de una rutina** según su frecuencia y dificultad.
- **Clasificar el nivel del usuario** según su perfil físico.
- **Sugerir ejercicios** filtrados por nivel.

Originalmente esa lógica eran funciones con `if/else` encadenados: cada vez que
había que cambiar una regla, tocábamos la función existente (riesgo de romper lo
que ya funcionaba). Se refactorizó aplicando **2 patrones de diseño** y
**3 principios SOLID**.

### Resumen

| Mejora | Dónde | Qué aporta |
|---|---|---|
| **Patrón Specification** | `controllers/patterns/Specification.ts`, `controllers/specs/` | Filtrado de ejercicios con reglas componibles |
| **Patrón Chain of Responsibility** | `controllers/patterns/Regla.ts`, `controllers/rules/` | Motor de reglas genérico para clasificar niveles |
| **SRP** (Single Responsibility) | Cada regla / spec | Una clase = una sola regla = una sola razón para cambiar |
| **OCP** (Open/Closed) | Reglas y specs | Se agregan reglas creando clases, sin modificar las existentes |
| **DIP** (Dependency Inversion) | Controllers y motor | Dependen de abstracciones (`Regla<C,R>`, `Specification<T>`), no de lógica concreta |

---

### 1️⃣ Patrón Specification — filtrado de ejercicios

**Problema (antes):** la condición de filtrado estaba pegada dentro del `filter`.
Agregar un criterio nuevo obligaba a editar esa línea.

```ts
// ANTES — SugerenciaController.ts
export function getSugerencias(nivel: Nivel, ejercicios: Ejercicio[]): Ejercicio[] {
  return ejercicios.filter((e) => e.activo && e.nivel_recomendado === nivel);
}
```

**Solución (después):** cada criterio es una *Specification* independiente y
componible con `.and()`, `.or()`, `.not()`.

```ts
// DESPUÉS — cada regla es una clase reutilizable (SRP)
class EjercicioActivoSpec   { isSatisfiedBy(e) { return e.activo; } }
class NivelRecomendadoSpec  { isSatisfiedBy(e) { return e.nivel_recomendado === this.nivel; } }

export function getSugerencias(nivel: Nivel, ejercicios: Ejercicio[]): Ejercicio[] {
  const criterio = new EjercicioActivoSpec().and(new NivelRecomendadoSpec(nivel));
  return ejercicios.filter((e) => criterio.isSatisfiedBy(e));
}
```

➡️ Para sugerir, por ejemplo, solo ejercicios de "pecho" basta con encadenar
`.and(new GrupoMuscularSpec('pecho'))`. **No se modifica nada del código existente** (OCP).

---

### 2️⃣ Patrón Chain of Responsibility — clasificación de niveles

**Problema (antes):** cadena de `if/else` mezclando todas las reglas en una sola función.

```ts
// ANTES — SugerenciaController.ts
export function clasificarUsuario(perfil: PerfilFisico): Nivel {
  if (perfil.experiencia === 'nunca' || perfil.actividad_actual === 'sedentario') return 'Principiante';
  if (perfil.experiencia === 'avanzado' && perfil.actividad_actual === 'muy_activo') return 'Avanzado';
  return 'Intermedio';
}
```

**Solución (después):** un **motor de reglas genérico** evalúa una cadena de
reglas; cada regla es una clase con una sola condición. La primera que aplica decide.

```ts
// patterns/Regla.ts — motor genérico (DIP: depende de la abstracción Regla<C,R>)
export interface Regla<TContext, TResult> {
  evaluar(contexto: TContext): TResult | null;   // null = no aplica, pasa a la siguiente
}
export function ejecutarCadena<C, R>(reglas: Regla<C, R>[], ctx: C, porDefecto: R): R {
  for (const regla of reglas) {
    const r = regla.evaluar(ctx);
    if (r !== null) return r;
  }
  return porDefecto;
}

// rules/reglasNivelUsuario.ts — reglas concretas (SRP)
class ReglaPrincipiante implements Regla<PerfilFisico, Nivel> { /* ... */ }
class ReglaAvanzado     implements Regla<PerfilFisico, Nivel> { /* ... */ }
export const REGLAS_NIVEL_USUARIO = [new ReglaPrincipiante(), new ReglaAvanzado()];

// SugerenciaController.ts — fachada
export function clasificarUsuario(perfil: PerfilFisico): Nivel {
  return ejecutarCadena(REGLAS_NIVEL_USUARIO, perfil, 'Intermedio');
}
```

➡️ El mismo motor genérico se **reutiliza** para clasificar el nivel de una rutina
(`RutinaController.calcularNivel` con `REGLAS_NIVEL_RUTINA`). Agregar una regla
nueva = crear una clase y meterla al arreglo. **El motor nunca cambia** (OCP).

---

### Principios SOLID demostrados

- **SRP (Responsabilidad Única):** cada `Regla` y cada `Specification` encapsula
  una sola condición de negocio → una sola razón para cambiar.
- **OCP (Abierto/Cerrado):** el sistema queda *abierto a extensión* (nuevas reglas
  o specs como clases nuevas) y *cerrado a modificación* (el motor `ejecutarCadena`
  y la composición de specs no se tocan).
- **DIP (Inversión de Dependencias):** los controllers y el motor dependen de las
  abstracciones `Regla<C,R>` y `Specification<T>`, no de implementaciones
  concretas. Las reglas concretas se **inyectan** desde fuera (arreglos de reglas).

> 💡 Las firmas públicas (`calcularNivel`, `clasificarUsuario`, `getSugerencias`)
> se mantuvieron como **fachada**, así las vistas no se modificaron y la app sigue
> funcionando igual. El refactor es 100 % interno al core.

---

## Estructura del core refactorizado

```
src/controllers/
├── patterns/
│   ├── Specification.ts        # Patrón Specification (base + AND/OR/NOT)
│   └── Regla.ts                # Patrón Chain of Responsibility (motor genérico)
├── specs/
│   └── ejercicioSpecs.ts       # Specs concretas sobre Ejercicio
├── rules/
│   ├── reglasNivelUsuario.ts   # Reglas de nivel de usuario
│   └── reglasNivelRutina.ts    # Reglas de nivel de rutina
├── RutinaController.ts         # Fachada: calcularNivel() / estaCompleta()
└── SugerenciaController.ts     # Fachada: clasificarUsuario() / getSugerencias()
```

---

## Cómo ejecutar el proyecto

```bash
npm install
npm run dev       # servidor de desarrollo en http://localhost:5173
npm run build     # build de producción (tsc -b && vite build)
npm run preview   # previsualizar el build
npm run lint      # ESLint
```

> La `anon key` de Supabase ya viene configurada en `src/services/supabaseClient.ts`.

### Despliegue (Vercel)

El proyecto incluye `vercel.json` con el rewrite para SPA. Para desplegar:

1. Sube el repo a GitHub.
2. En [vercel.com](https://vercel.com) → **Add New → Project** → importa el repo.
3. Framework preset: **Vite**. Build command: `npm run build`. Output: `dist`.
4. Deploy. ✅

---

## Arquitectura general (MVC)

```
src/
├── models/         # Interfaces TypeScript (types.ts)
├── services/       # Acceso a Supabase (solo datos, sin lógica de negocio)
├── controllers/    # Lógica de negocio (core: SOLID + patrones)
├── context/        # Estado global (AppContext)
├── components/     # Componentes reutilizables (Navbar, NivelBadge)
└── views/          # Pantallas (Login, MisRutinas, EditorRutina, Admin...)
```

**Regla de capas:** las vistas nunca llaman a Supabase directamente; los services
solo hablan con Supabase; la lógica de negocio vive en los controllers.
