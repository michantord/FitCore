# FitCore — Plataforma de Gestión de Rutinas de Gimnasio
> Proyecto de semestre · Ingeniería Web · Plataforma: React + TypeScript · Arquitectura: MVC

---

## 1. Descripción General del Proyecto

**FitCore** es una aplicación web SPA (Single Page Application) orientada a la gestión de rutinas de entrenamiento. Está construida con **React + TypeScript** bajo una arquitectura **MVC**, y es accesible desde cualquier navegador web, ya sea en computadora, tablet o dispositivo móvil.

La plataforma diferencia dos roles de usuario:

| Rol | Descripción |
|-----|-------------|
| **Admin** | Control total: gestiona el catálogo de ejercicios y puede ver todos los usuarios y sus rutinas |
| **Usuario** | Gestiona únicamente sus propias rutinas y hace seguimiento de su progreso |

El login es simulado: al ingresar, el usuario elige con qué rol desea entrar (Admin o Usuario normal), sin autenticación real.

---

## 2. Core Propuesto

### ¿Qué es el core?

El core del sistema es el **módulo de creación y edición de rutinas con asignación automática de nivel**.

Cuando un usuario arma su rutina seleccionando ejercicios del catálogo, el sistema evalúa condiciones en tiempo real y toma decisiones automáticas sobre la rutina:

- **¿El ejercicio está activo?** → Si el Admin lo desactivó (por ejemplo, una máquina no disponible), el ejercicio aparece bloqueado y no puede agregarse.
- **¿La rutina tiene al menos 3 ejercicios?** → Si no, el botón "Guardar" se deshabilita automáticamente.
- **¿Cuál es el nivel de la rutina?** → Según la frecuencia semanal y la dificultad de los ejercicios, el sistema asigna automáticamente: **Principiante**, **Intermedio** o **Avanzado**.

El administrador puede activar o desactivar ejercicios del catálogo, lo que impacta en tiempo real a todas las rutinas que los contienen.

### Lógica condicional (if-else)

```
si ejercicio.activo == false
  → mostrar como bloqueado, no permitir agregar

si rutina.ejercicios.length < 3
  → deshabilitar botón guardar

si frecuencia >= 5 Y dificultad == "alto"
  → nivel = "Avanzado"
sino si frecuencia <= 2 Y dificultad == "básico"
  → nivel = "Principiante"
sino
  → nivel = "Intermedio"
```

---

## 3. Alcance del Core

### Incluye

- ✅ Login simulado con selector de rol (Admin / Usuario)
- ✅ CRUD completo de rutinas (cada usuario edita solo las suyas)
- ✅ CRUD de ejercicios del catálogo (solo Admin)
- ✅ Asignación automática de nivel según ejercicios y frecuencia
- ✅ Validaciones condicionales en tiempo real
- ✅ Vista diferenciada por rol
- ✅ Bloqueo de ejercicios inactivos en la vista del usuario

### No incluye

- ❌ Autenticación real (login simulado)
- ❌ Pagos o suscripciones
- ❌ Notificaciones push o por correo
- ❌ Integración con APIs externas
- ❌ Historial de sesiones o estadísticas avanzadas

---

## 4. Diagramas

### 4.1 Diagrama Entidad-Relación (Global)

```
USUARIO ||--o{ RUTINA : "crea"
RUTINA  ||--o{ RUTINA_EJERCICIO : "contiene"
EJERCICIO ||--o{ RUTINA_EJERCICIO : "aparece en"
```

**Entidades y atributos:**

**USUARIO**
- `id` (PK)
- `nombre`
- `email`
- `rol` (admin / usuario)
- `ultimo_acceso`

**RUTINA**
- `id` (PK)
- `usuario_id` (FK → USUARIO)
- `nombre`
- `nivel` (Principiante / Intermedio / Avanzado)
- `frecuencia_semanal`
- `activa`
- `fecha_modificacion`

**EJERCICIO**
- `id` (PK)
- `nombre`
- `grupo_muscular`
- `dificultad` (básico / medio / alto)
- `activo`

**RUTINA_EJERCICIO** *(tabla intermedia)*
- `rutina_id` (FK → RUTINA)
- `ejercicio_id` (FK → EJERCICIO)
- `series`
- `repeticiones`

---

### 4.2 Diagrama de Clases (Global)

```
┌──────────────────────────┐
│         Usuario           │
├──────────────────────────┤
│ + id: number             │
│ + nombre: string         │
│ + email: string          │
│ + rol: string            │
│ + ultimoAcceso: Date     │
├──────────────────────────┤
│ + login(): boolean       │
│ + esAdmin(): boolean     │
└────────────┬─────────────┘
             │ 1
             │ crea
             │ 0..*
┌────────────▼─────────────┐
│          Rutina           │
├──────────────────────────┤
│ + id: number             │
│ + usuarioId: number      │
│ + nombre: string         │
│ + nivel: string          │
│ + frecuenciaSemanal: int │
│ + activa: boolean        │
│ + fechaModificacion: Date│
├──────────────────────────┤
│ + calcularNivel(): string│
│ + estaCompleta(): boolean│
│ + tieneEjercicioInactivo(): boolean │
└────────────┬─────────────┘
             │ 1
             │ contiene
             │ 0..*
┌────────────▼─────────────┐     ┌──────────────────────────┐
│      RutinaEjercicio      │     │        Ejercicio          │
├──────────────────────────┤     ├──────────────────────────┤
│ + rutinaId: number       │     │ + id: number             │
│ + ejercicioId: number    ├─────┤ + nombre: string         │
│ + series: number         │     │ + grupoMuscular: string  │
│ + repeticiones: number   │     │ + dificultad: string     │
└──────────────────────────┘     │ + activo: boolean        │
                                 ├──────────────────────────┤
                                 │ + activar(): void        │
                                 │ + desactivar(): void     │
                                 └──────────────────────────┘

┌──────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────┐
│     RutinaController     │   │   EjercicioController    │   │      AuthController      │
├──────────────────────────┤   ├──────────────────────────┤   ├──────────────────────────┤
│ + crear(data): Rutina    │   │ + crear(data): Ejercicio │   │ + login(rol): Usuario    │
│ + editar(id,data): Rutina│   │ + editar(id,data): Ej.  │   │ + logout(): void         │
│ + eliminar(id): void     │   │ + toggleActivo(id): void │   │ + getRolActual(): string │
│ + listarPorUsuario(): [] │   │ + listar(): Ejercicio[]  │   └──────────────────────────┘
│ + listarTodas(): []      │   └──────────────────────────┘
└──────────────────────────┘
```

---

### 4.3 Diagrama de Casos de Uso (Global)

```
                    ┌─────────────────────────────────────────┐
                    │              Sistema FitCore             │
                    │                                         │
  ┌───────┐         │  ┌─────────────────────────────────┐   │
  │       │─────────┼─►│     Login con selector de rol   │   │
  │ Admin │         │  └─────────────────────────────────┘   │
  │       │         │                                         │
  │  (A)  │─────────┼─►│     Gestionar ejercicios (CRUD) │   │
  │       │         │  └─────────────────────────────────┘   │
  └───────┘         │                                         │
                    │  ┌─────────────────────────────────┐   │
                    │  │   Ver usuarios y sus rutinas     │   │◄── Solo Admin
                    │  └─────────────────────────────────┘   │
                    │                                         │
                    │  ┌─────────────────────────────────┐   │
                    │  │   Activar / desactivar ejercicio │   │◄── Solo Admin
                    │  └─────────────────────────────────┘   │
                    │                                         │
  ┌───────┐         │  ┌─────────────────────────────────┐   │
  │       │─────────┼─►│     Login con selector de rol   │   │
  │Usuario│         │  └─────────────────────────────────┘   │
  │       │         │                                         │
  │  (U)  │─────────┼─►│         Crear rutina            │   │
  │       │         │  └─────────────────────────────────┘   │
  └───────┘         │                                         │
                    │  ┌─────────────────────────────────┐   │
                    │  │    Editar / eliminar rutina      │   │◄── Solo Usuario dueño
                    │  └─────────────────────────────────┘   │
                    │                                         │
                    │  ┌─────────────────────────────────┐   │
                    │  │  Agregar ejercicios a la rutina  │   │◄── Solo Usuario
                    │  └─────────────────────────────────┘   │
                    │                                         │
                    │  ┌─────────────────────────────────┐   │
                    │  │      Ver nivel asignado          │   │◄── Solo Usuario
                    │  └─────────────────────────────────┘   │
                    └─────────────────────────────────────────┘
```

---

### 4.4 Diagrama de Actividades — Core (Crear/Editar Rutina)

```
         ●  (inicio)
         │
         ▼
┌─────────────────────────┐
│  Seleccionar o crear    │
│       rutina            │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Agregar ejercicio      │
│    del catálogo         │
└────────────┬────────────┘
             │
             ▼
      ┌──────────────┐
      │ ¿Ejercicio   │
      │   activo?    │
      └──┬───────┬───┘
         │ Sí    │ No
         │       ▼
         │  ┌────────────────────┐
         │  │ Mostrar aviso      │
         │  │ "Bloqueado"        │
         │  └────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Añadir ejercicio       │
│    a la rutina          │
└────────────┬────────────┘
             │
             ▼
      ┌──────────────────┐
      │  ¿Tiene ≥ 3      │
      │  ejercicios?     │
      └──┬───────────┬───┘
         │ Sí        │ No
         │           ▼
         │  ┌──────────────────────┐
         │  │ Botón "Guardar"      │
         │  │  deshabilitado       │
         │  └──────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Calcular nivel          │
│  automáticamente        │
└────────────┬────────────┘
             │
             ▼
      ┌────────────────────────────┐
      │  ¿Frecuencia y dificultad? │
      └───┬─────────────┬─────┬───┘
          │             │     │
     ≤2/básico        Otro  ≥5/alto
          │             │     │
          ▼             ▼     ▼
   ┌────────────┐ ┌──────────┐ ┌──────────────┐
   │Principiante│ │Intermedio│ │   Avanzado   │
   └─────┬──────┘ └────┬─────┘ └──────┬───────┘
         │             │              │
         └─────────────┴──────────────┘
                       │
                       ▼
          ┌─────────────────────────┐
          │  Guardar rutina con     │
          │   nivel asignado        │
          └────────────┬────────────┘
                       │
                      ◎  (fin)
```

---

### 4.5 Wireframes — Core

#### Pantalla 1: Login / Selección de rol

```
┌──────────────────────────────────┐
│           [  Logo  ]             │
│            FitCore               │
│      Elige cómo ingresar         │
│                                  │
│  ┌─────────────┐ ┌─────────────┐ │
│  │    Admin    │ │   Usuario   │ │
│  │ Control total│ │ Mis rutinas│ │
│  └─────────────┘ └─────────────┘ │
│                                  │
│  [ Entrar como Admin           ] │
└──────────────────────────────────┘
```

---

#### Pantalla 2: Mis Rutinas (Usuario)

```
┌──────────────────────────────────┐
│  Mis rutinas          [+ Nueva]  │
├──────────────────────────────────┤
│ Full body 3x                     │
│ 6 ejercicios · 3 días/sem  [Avanzado] │
├──────────────────────────────────┤
│ Cardio AM                        │
│ 4 ejercicios · 5 días/sem  [Intermedio] │
├──────────────────────────────────┤
│ Sin nombre  (incompleta)         │
│ 1 ejercicio              [⚠ Incompleta] │
└──────────────────────────────────┘
```

---

#### Pantalla 3: Editor de Rutina (Core)

```
┌──────────────────────────────────┐
│ ← Volver         Editar rutina   │
├──────────────────────────────────┤
│ Nombre:                          │
│ [ Full body 3x                 ] │
│                                  │
│ Frecuencia semanal:              │
│  [L] [ ] [X] [ ] [V] [ ] [ ]    │
│                                  │
│ Ejercicios (3 / mín 3):          │
│ ┌────────────────────────────┐   │
│ │ Sentadilla · 4×12        ✕│   │
│ │ Press banca · 3×10       ✕│   │
│ │ Máquina Hack [Bloqueado]  │   │
│ └────────────────────────────┘   │
│ [+ Agregar ejercicio]            │
│                                  │
│ Nivel calculado: [Avanzado]      │
│                    [Guardar]     │
└──────────────────────────────────┘
```

---

#### Pantalla 4: Admin — Catálogo de Ejercicios

```
┌──────────────────────────────────┐
│  Ejercicios          [+ Agregar] │
├──────────────────────────────────┤
│ Sentadilla                       │
│ Piernas · Alto   [Activo] [Editar]│
├──────────────────────────────────┤
│ Burpees                          │
│ Cardio · Alto    [Activo] [Editar]│
├──────────────────────────────────┤
│ Máquina Hack  (desactivado)      │
│ Piernas · Medio [Inactivo][Activar]│
└──────────────────────────────────┘
```

---

## 5. Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend (Vista) | React + TypeScript |
| Estado / Lógica (Controlador) | React Context + hooks personalizados |
| Datos simulados (Modelo) | Objetos TypeScript / localStorage |
| Estilos | CSS Modules o TailwindCSS |
| Compatibilidad | Navegador web (desktop y móvil) |

---

## 6. Resumen de Condiciones (if-else) del Core

| Condición | Resultado si se cumple | Resultado si no se cumple |
|-----------|----------------------|--------------------------|
| Ejercicio desactivado por Admin | Se muestra como bloqueado | Se muestra disponible para agregar |
| Rutina con < 3 ejercicios | Botón guardar deshabilitado | Botón guardar habilitado |
| Frecuencia ≥ 5 días Y dificultad alta | Nivel → Avanzado | Evalúa siguiente condición |
| Frecuencia ≤ 2 días Y dificultad básica | Nivel → Principiante | Nivel → Intermedio |
| Rol del usuario = Admin | Ve todas las rutinas y el catálogo completo | Solo ve sus propias rutinas |

---

*FitCore · Proyecto de semestre · Ingeniería Web*
