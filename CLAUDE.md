# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos esenciales

```bash
npm run dev       # servidor de desarrollo en localhost:5173
npm run build     # build de producción (tsc -b && vite build)
npm run preview   # previsualizar el build
npm run lint      # ESLint
```

Verifica siempre con `npm run build` (0 errores TS) antes de dar algo por listo. No hay tests automatizados.

## Stack

| Capa | Tecnología |
|---|---|
| UI | React 19 + TypeScript 6 |
| Bundler | Vite 8 |
| Estilos | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Backend / DB | Supabase (PostgreSQL + Auth) |
| Routing | React Router v7 |
| Estado global | React Context (`AppContext`) |

## Arquitectura MVC

```
src/
├── models/
│   └── types.ts              # Todas las interfaces TypeScript
├── services/
│   ├── supabaseClient.ts     # Instancia única del cliente Supabase
│   ├── profileService.ts     # Lectura de tabla profiles
│   ├── ejercicioService.ts   # CRUD tabla ejercicio
│   └── rutinaService.ts      # CRUD tabla rutina + rutina_ejercicio
├── controllers/
│   └── RutinaController.ts   # calcularNivel(), estaCompleta()
├── context/
│   └── AppContext.tsx         # Estado global + auth listener
├── components/
│   ├── Navbar.tsx
│   └── NivelBadge.tsx
└── views/
    ├── LoginView.tsx           # Email + contraseña real (Supabase Auth)
    ├── MisRutinasView.tsx      # Lista de rutinas del usuario
    ├── EditorRutinaView.tsx    # Crear / editar rutina (core del proyecto)
    ├── AdminEjerciciosView.tsx # CRUD catálogo de ejercicios
    └── AdminUsuariosView.tsx   # Vista de todos los usuarios y sus rutinas
```

**Regla clave:** Los `services/` solo llaman a Supabase. La lógica de negocio va en `controllers/`. Las vistas nunca llaman a Supabase directamente.

## Base de datos (Supabase)

URL: `https://dzmyyihrepddyexkcjqa.supabase.co`

### Tablas actuales

| Tabla | Descripción |
|---|---|
| `profiles` | Extiende `auth.users`. Campos: `id UUID`, `nombre`, `rol` |
| `ejercicio` | Catálogo global. Campos: `nombre`, `grupo_muscular`, `dificultad`, `activo`, `nivel_recomendado` (nuevo) |
| `rutina` | Rutinas de usuario. `usuario_id UUID` → `profiles.id` |
| `rutina_ejercicio` | Tabla intermedia con `series` y `repeticiones` |
| `perfil_fisico` | Datos físicos del usuario para el motor de sugerencias (nuevo) |

### Tipos importantes

- `ejercicio.dificultad`: `'basico' | 'medio' | 'alto'` (minúsculas)
- `ejercicio.nivel_recomendado`: `'Principiante' | 'Intermedio' | 'Avanzado' | null`
- `rutina.nivel`: `'Principiante' | 'Intermedio' | 'Avanzado'` (titlecase)
- `rutina.usuario_id`: UUID string, no entero

### RLS

RLS habilitado en las 4 tablas. Usa la función `get_mi_rol()` (SECURITY DEFINER) para evitar recursión.
- `profiles`: todos los autenticados pueden leer
- `ejercicio`: todos leen; solo admin escribe
- `rutina`: usuario ve las suyas; admin ve todas
- `rutina_ejercicio`: acceso a través de la rutina dueña

## Lógica de negocio — Core original

### Cálculo de nivel — `calcularNivel(frecuencia, ejercicios)`

```
dificultad dominante = la más frecuente entre los ejercicios de la rutina

si frecuencia >= 5 Y dominante == 'alto'   → 'Avanzado'
si frecuencia <= 2 Y dominante == 'basico' → 'Principiante'
sino                                        → 'Intermedio'
```

### Validaciones en tiempo real

- Rutina con < 3 ejercicios → botón "Guardar" deshabilitado
- Ejercicio con `activo = false` → aparece bloqueado, no se puede agregar

## Nueva funcionalidad: Perfil Físico y Sugerencia de Rutina

### Concepto

Al crear una rutina, el usuario puede (opcionalmente) completar un formulario de perfil físico. Con esos datos, el sistema infiere su **nivel de experiencia** y le sugiere ejercicios adecuados del catálogo.

### Tabla `perfil_fisico`

```sql
CREATE TABLE perfil_fisico (
  usuario_id        UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  edad              INTEGER,
  peso_kg           NUMERIC(5,1),
  altura_cm         INTEGER,
  experiencia       VARCHAR(20) CHECK (experiencia IN ('nunca', 'ocasional', 'regular', 'avanzado')),
  actividad_actual  VARCHAR(20) CHECK (actividad_actual IN ('sedentario', 'activo', 'muy_activo')),
  objetivo          VARCHAR(20) CHECK (objetivo IN ('perder_peso', 'ganar_musculo', 'tonificar', 'resistencia'))
);
```

### Campo nuevo en `ejercicio`

```sql
ALTER TABLE ejercicio
  ADD COLUMN nivel_recomendado VARCHAR(15)
  CHECK (nivel_recomendado IN ('Principiante', 'Intermedio', 'Avanzado'));
```

El admin etiqueta cada ejercicio con el nivel al que está dirigido. Esto permite que el motor de sugerencias filtre ejercicios apropiados.

### Lógica de clasificación — `SugerenciaController`

```
si experiencia == 'nunca' O actividad_actual == 'sedentario'
  → nivel_usuario = 'Principiante'
sino si experiencia == 'regular' Y actividad_actual != 'sedentario'
  → nivel_usuario = 'Intermedio'
sino si experiencia == 'avanzado' Y actividad_actual == 'muy_activo'
  → nivel_usuario = 'Avanzado'
sino
  → nivel_usuario = 'Intermedio'

sugerencias = ejercicios.filter(e =>
  e.activo == true
  AND e.nivel_recomendado == nivel_usuario
)
```

### Flujo de usuario

1. Usuario va a crear/editar una rutina
2. Si no tiene `perfil_fisico`, aparece un formulario corto (puede omitirse)
3. Al completar el formulario → el sistema clasifica el nivel del usuario
4. Aparece una sección "Ejercicios sugeridos para ti" con ejercicios filtrados por nivel
5. El usuario puede agregar esos ejercicios con un clic, o ignorarlos y elegir manualmente

### Archivos a crear/modificar

| Archivo | Acción |
|---|---|
| `src/models/types.ts` | Añadir `PerfilFisico`, `NivelUsuario` |
| `src/services/perfilFisicoService.ts` | CRUD tabla `perfil_fisico` |
| `src/controllers/SugerenciaController.ts` | `clasificarUsuario()`, `getSugerencias()` |
| `src/views/PerfilFisicoView.tsx` | Formulario de datos físicos |
| `src/views/EditorRutinaView.tsx` | Añadir sección de sugerencias |
| `src/context/AppContext.tsx` | Añadir `perfilFisico` al estado global |
| `src/views/AdminEjerciciosView.tsx` | Añadir campo `nivel_recomendado` al form |

## Funcionalidades del Admin

El admin actualmente gestiona el catálogo de ejercicios y ve todos los usuarios con sus rutinas. Funcionalidades útiles a agregar:

- **Etiquetar ejercicios por nivel**: Al crear/editar un ejercicio, el admin asigna `nivel_recomendado`. Esto es el insumo que usa el motor de sugerencias.
- **Ver estadísticas del catálogo** en `AdminEjerciciosView`: qué ejercicios son los más agregados en rutinas (join con `rutina_ejercicio`), cuáles nunca se han usado.
- **Filtros en `AdminUsuariosView`**: filtrar usuarios por nivel de sus rutinas, ver cuántos son principiantes vs avanzados.
- **Ver perfiles físicos**: En la vista de usuarios, el admin puede expandir y ver el `perfil_fisico` de cada usuario (contexto útil para un entrenador).

## Roles de usuario

| Rol | Acceso |
|---|---|
| `admin` | CRUD ejercicios (incluido `nivel_recomendado`), ver todos los usuarios y sus rutinas, ver perfiles físicos |
| `usuario` | CRUD de sus propias rutinas, completar su perfil físico, ver sugerencias de ejercicios |

El rol se guarda en `profiles.rol`. Se determina al hacer login leyendo el perfil desde Supabase.

## Design system

Tema oscuro. Fuentes de Google Fonts (incluidas en `index.html`).

| Token | Valor | Uso |
|---|---|---|
| `night` | `#0E1014` | Fondo base |
| `surface` | `#1C2030` | Cards y paneles |
| `steel` | `#2E3347` | Bordes |
| `dim` | `#6C7392` | Texto secundario |
| `volt` | `#C8F84A` | Acento principal, botones primarios |
| `ice` | `#E0F0FF` | Info / admin |
| `danger` | `#FF4D4D` | Errores, bloqueados |
| `warn` | `#F59E0B` | Alertas, incompleto |
| `win` | `#22C55E` | Éxito, nivel principiante |

| Rol tipográfico | Fuente | Uso |
|---|---|---|
| Títulos (H1/H2) | Syne 700–800 | Encabezados de vista |
| Labels / tags | DM Mono 500, uppercase | Etiquetas, badges, stats |
| Cuerpo | DM Sans 400–500 | Texto general |

Los colores están definidos como tokens de Tailwind v4 en `src/index.css` dentro de `@theme {}`. Úsalos como clases (`bg-volt`, `text-dim`, `border-steel`). Para propiedades sin clase Tailwind equivalente usa `style={{ ... }}` con el valor hex directo.

## Convenciones

- Todos los imports de tipos usan `import type { ... }` (requerido por `verbatimModuleSyntax`)
- Los servicios devuelven el tipo exacto o lanzan error — no devuelven `null` salvo `getById`
- `AppContext` es la única fuente de verdad para `usuarioActual`, `ejercicios`, `rutinas`, `profiles`
- Después de cualquier mutación (create/update/delete) llamar al `refresh*` correspondiente del contexto

## Configuración de Supabase para nuevos entornos

1. Ejecutar `Contexto/fitcore_supabase.sql` en el SQL Editor
2. Crear usuarios en **Authentication → Users → Add user** (desactivar "Confirm email" en Auth Settings)
3. Insertar sus UUIDs en `profiles` con el rol correspondiente
4. La `anon key` ya está en `src/services/supabaseClient.ts`
