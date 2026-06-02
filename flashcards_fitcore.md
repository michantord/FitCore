# PROMPT PARA CLAUDE — Genera un HTML interactivo de flashcards

Hola Claude! Necesito que generes un **archivo HTML único y autocontenido** (todo en un solo `.html`, sin archivos externos) con flashcards interactivas para estudiar el proyecto **FitCore** de mi materia de Ingeniería Web.

## Requisitos de diseño y UX

- Estilo moderno, oscuro (dark mode), con colores tipo `#0f172a` de fondo y acentos en verde/cyan (`#22d3ee` o similar).
- Cada tarjeta debe tener **cara frontal** (pregunta) y **cara trasera** (respuesta), con animación de volteo 3D al hacer clic.
- Mostrar el número de tarjeta actual y el total (ej: `5 / 30`).
- Botones: **← Anterior**, **→ Siguiente**, y **↺ Voltear**.
- También poder voltear con la tecla `Espacio`, ir a la siguiente con `→` e ir a la anterior con `←`.
- Mostrar la **categoría** de cada tarjeta como un chip/tag de color arriba (cada categoría tiene su color).
- Barra de progreso arriba que avance conforme avanzas tarjetas.
- Botón para ir a una tarjeta aleatoria.
- Botón para reiniciar al principio.
- En la respuesta, los bloques de código deben verse bien formateados (fuente monospace, fondo oscuro, con highlight de sintaxis simple si es posible).
- Responsive: que se vea bien en celular también.

## Las categorías y sus colores sugeridos

| Categoría | Color sugerido |
|-----------|---------------|
| AUTENTICACIÓN | azul (`#3b82f6`) |
| EJERCICIOS | verde (`#22c55e`) |
| RUTINAS | naranja (`#f97316`) |
| CORE — LÓGICA | rojo/rosa (`#f43f5e`) |
| BASE DE DATOS | violeta (`#a855f7`) |
| STACK TÉCNICO | cyan (`#22d3ee`) |

---

## Las 30 flashcards (en formato Pregunta / Respuesta)

---

### AUTENTICACIÓN

**Tarjeta 1**
- **Categoría:** AUTENTICACIÓN
- **Pregunta:** ¿Dónde se valida que email y contraseña no estén vacíos en el LOGIN?
- **Respuesta:**
`server.ts` línea ~41 — endpoint `POST /api/login`:
```typescript
if (!email || !password) {
  return res.status(400).json({ error: 'Correo y contraseña son requeridos.' });
}
```

---

**Tarjeta 2**
- **Categoría:** AUTENTICACIÓN
- **Pregunta:** ¿Dónde se valida el formato de la contraseña en el REGISTRO?
- **Respuesta:**
`server.ts` línea ~76 — endpoint `POST /api/signup`:
```typescript
const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*.])[\w!@#$%^&*.]{8,}$/;
if (!passwordRegex.test(password)) { ... }
```
Requisitos: mínimo 8 caracteres, 1 número, 1 carácter especial (`!@#$%^&*.`).

---

**Tarjeta 3**
- **Categoría:** AUTENTICACIÓN
- **Pregunta:** ¿Dónde se llama a Supabase para autenticar al usuario?
- **Respuesta:**
`server.ts` línea ~46 (login) y ~85 (signup):
```typescript
// Login:
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
// Signup:
const { data, error } = await supabase.auth.signUp({ email, password });
```

---

**Tarjeta 4**
- **Categoría:** AUTENTICACIÓN
- **Pregunta:** ¿Dónde se verifica si el usuario ya tiene sesión activa al cargar la página de login?
- **Respuesta:**
`index.html` línea ~52 — antes de mostrar el formulario:
```javascript
if (!localStorage.getItem('token')) { ... }
// Si hay token → redirige al dashboard automáticamente
```

---

**Tarjeta 5**
- **Categoría:** AUTENTICACIÓN
- **Pregunta:** ¿Dónde se guarda el token al iniciar sesión correctamente?
- **Respuesta:**
`index.html` línea ~137 — dentro del handler del form submit:
```javascript
localStorage.setItem('token', data.token);
```

---

**Tarjeta 6**
- **Categoría:** AUTENTICACIÓN
- **Pregunta:** ¿Dónde se protege el dashboard para que no accedan usuarios sin sesión?
- **Respuesta:**
`dashboard.html` línea ~52 — al inicio del script:
```javascript
if (!localStorage.getItem('token')) {
  window.location.href = '/index.html';
}
```

---

### EJERCICIOS

**Tarjeta 7**
- **Categoría:** EJERCICIOS
- **Pregunta:** ¿Dónde se validan los datos al CREAR un ejercicio?
- **Respuesta:**
`server.ts` línea ~164 — endpoint `POST /api/exercises`:
```typescript
if (!name || !groupId || !muscleId) {
  return res.status(400).json({ error: 'Faltan datos requeridos.' });
}
```

---

**Tarjeta 8**
- **Categoría:** EJERCICIOS
- **Pregunta:** ¿Dónde se inserta un ejercicio nuevo en la base de datos?
- **Respuesta:**
`server.ts` línea ~168 — endpoint `POST /api/exercises`:
```typescript
const { data: newExercise, error } = await supabase
  .from('exercises')
  .insert({ name, group_id: groupId, muscle_id: muscleId })
  .select('id, name, muscle_groups(name), muscles(name)')
  .single();
```

---

**Tarjeta 9**
- **Categoría:** EJERCICIOS
- **Pregunta:** ¿Dónde se consultan todos los ejercicios del catálogo?
- **Respuesta:**
`server.ts` línea ~200 — endpoint `GET /api/exercises`:
```typescript
const { data: dbExercises, error } = await supabase
  .from('exercises')
  .select('id, name, muscle_groups(name), muscles(name)')
  .order('id', { ascending: true });
```

---

**Tarjeta 10**
- **Categoría:** EJERCICIOS
- **Pregunta:** ¿Dónde se carga la lista de ejercicios en el frontend?
- **Respuesta:**
`dashboard.html` línea ~146 — función `loadExercises()`:
```javascript
fetch('/api/exercises')
  .then(r => r.json())
  .then(exercises => { /* renderiza la lista en el DOM */ });
```

---

**Tarjeta 11**
- **Categoría:** EJERCICIOS
- **Pregunta:** ¿Dónde se cargan los grupos musculares en el formulario de nuevo ejercicio?
- **Respuesta:**
`dashboard.html` línea ~66 — función `loadGroups()`:
```javascript
fetch('/api/muscle-groups')
  .then(r => r.json())
  .then(groups => { /* llena el <select> de grupos */ });
```

---

**Tarjeta 12**
- **Categoría:** EJERCICIOS
- **Pregunta:** ¿Dónde se cargan los músculos según el grupo muscular seleccionado?
- **Respuesta:**
`dashboard.html` línea ~83 — event listener sobre `groupSelect`:
```javascript
groupSelect.addEventListener('change', () => {
  const groupId = groupSelect.value;
  if (!groupId) return;
  fetch(`/api/muscles/${groupId}`)
    .then(r => r.json())
    .then(muscles => { /* llena el <select> de músculos */ });
});
```

---

### RUTINAS

**Tarjeta 13**
- **Categoría:** RUTINAS
- **Pregunta:** ¿Dónde se valida el nombre al CREAR una rutina?
- **Respuesta:**
`server.ts` línea ~295 — endpoint `POST /api/routines`:
```typescript
if (!name) {
  return res.status(400).json({ error: 'El nombre de la rutina es requerido.' });
}
```

---

**Tarjeta 14**
- **Categoría:** RUTINAS
- **Pregunta:** ¿Dónde se inserta una rutina nueva en la base de datos?
- **Respuesta:**
`server.ts` línea ~302 — endpoint `POST /api/routines`:
```typescript
const { data: newRoutine, error } = await supabase
  .from('routines')
  .insert({
    name,
    difficulty: difficulty || 'Intermedio',
    duration_minutes: duration_minutes || 30,
    status: status || 'activa',
    progress: progress || 0,
    exercise_ids: exercise_ids || [],
    user_id: user_id || null
  })
```

---

**Tarjeta 15**
- **Categoría:** RUTINAS
- **Pregunta:** ¿Dónde se consultan todas las rutinas?
- **Respuesta:**
`server.ts` línea ~230 — endpoint `GET /api/routines`:
```typescript
const { data: dbRoutines, error } = await supabase
  .from('routines')
  .select('*')
  .order('id', { ascending: true });
```

---

**Tarjeta 16**
- **Categoría:** RUTINAS
- **Pregunta:** ¿Dónde se resuelven los ejercicios de una rutina individual al consultarla?
- **Respuesta:**
`server.ts` línea ~265 — endpoint `GET /api/routines/:id`:
```typescript
if (routine.exercise_ids && routine.exercise_ids.length > 0) {
  const { data: dbExercises } = await supabase
    .from('exercises')
    .select('id, name, muscle_groups(name), muscles(name)')
    .in('id', routine.exercise_ids);
}
```

---

### CORE — LÓGICA CONDICIONAL

**Tarjeta 17**
- **Categoría:** CORE — LÓGICA
- **Pregunta:** ¿Dónde se calcula automáticamente el NIVEL de la rutina (Principiante / Intermedio / Avanzado)?
- **Respuesta:**
Actualmente **no está completamente implementado**. En `server.ts` línea ~304 solo se asigna el valor por defecto:
```typescript
difficulty: difficulty || 'Intermedio',
```
Según la documentación, la lógica pendiente de implementar es:
```
frecuencia >= 5 Y dificultad == "alto"   → "Avanzado"
frecuencia <= 2 Y dificultad == "básico" → "Principiante"
en otro caso                             → "Intermedio"
```

---

**Tarjeta 18**
- **Categoría:** CORE — LÓGICA
- **Pregunta:** ¿Dónde debería validarse que la rutina tenga mínimo 3 ejercicios antes de guardar?
- **Respuesta:**
En `server.ts` línea ~295, dentro del `POST /api/routines`. Actualmente **no está implementado** — el servidor acepta `exercise_ids: []`.
La validación pendiente sería:
```typescript
if (!exercise_ids || exercise_ids.length < 3) {
  return res.status(400).json({
    error: 'La rutina debe tener al menos 3 ejercicios.'
  });
}
```

---

**Tarjeta 19**
- **Categoría:** CORE — LÓGICA
- **Pregunta:** ¿Dónde se comprueba si un ejercicio está activo o bloqueado?
- **Respuesta:**
Actualmente **no está implementado**. El `GET /api/exercises` en `server.ts` línea ~204 no incluye el campo `activo`:
```typescript
// Actual (incompleto):
.select('id, name, muscle_groups(name), muscles(name)')
// Falta agregar: , activo
```
La lógica visual de bloqueo tampoco existe en `dashboard.html`.

---

**Tarjeta 20**
- **Categoría:** CORE — LÓGICA
- **Pregunta:** ¿Cuál es la lógica condicional completa del core según la documentación?
- **Respuesta:**
```
si ejercicio.activo == false
  → mostrar como bloqueado, no permitir agregar

si rutina.ejercicios.length < 3
  → deshabilitar botón "Guardar"

si frecuencia >= 5 Y dificultad == "alto"
  → nivel = "Avanzado"
sino si frecuencia <= 2 Y dificultad == "básico"
  → nivel = "Principiante"
sino
  → nivel = "Intermedio"
```

---

**Tarjeta 21**
- **Categoría:** CORE — LÓGICA
- **Pregunta:** ¿Qué pasa en tiempo real cuando el Admin desactiva un ejercicio del catálogo?
- **Respuesta:**
Según el diseño: ese ejercicio debe aparecer como **bloqueado** en la vista del usuario y no poder agregarse a ninguna rutina. Esto impacta en tiempo real a todas las rutinas que lo contienen.
En la UI del editor debería mostrarse: `Máquina Hack [Bloqueado]` (sin poder interactuar con él).

---

**Tarjeta 22**
- **Categoría:** CORE — LÓGICA
- **Pregunta:** ¿Qué pasa si la rutina tiene menos de 3 ejercicios?
- **Respuesta:**
El botón **"Guardar"** debe quedar **deshabilitado** automáticamente. Es una validación en tiempo real que debería ocurrir en el frontend mientras el usuario edita la rutina, y también validarse en el backend antes de insertar.

---

### BASE DE DATOS

**Tarjeta 23**
- **Categoría:** BASE DE DATOS
- **Pregunta:** ¿Cuáles son las 5 tablas de Supabase en el proyecto?
- **Respuesta:**
`users`, `routines`, `exercises`, `muscle_groups`, `muscles`

---

**Tarjeta 24**
- **Categoría:** BASE DE DATOS
- **Pregunta:** ¿Cuántos endpoints tiene actualmente el backend y cuáles son?
- **Respuesta:**
**9 endpoints** en `server.ts`:

| Método | Ruta |
|--------|------|
| POST | `/api/login` |
| POST | `/api/signup` |
| GET | `/api/muscle-groups` |
| GET | `/api/muscles/:groupId` |
| POST | `/api/exercises` |
| GET | `/api/exercises` |
| GET | `/api/routines` |
| GET | `/api/routines/:id` |
| POST | `/api/routines` |

---

**Tarjeta 25**
- **Categoría:** BASE DE DATOS
- **Pregunta:** ¿Qué endpoints FALTAN según el diseño completo del CRUD?
- **Respuesta:**
- `PUT /api/exercises/:id` — editar ejercicio / cambiar activo-inactivo
- `DELETE /api/exercises/:id` — eliminar ejercicio
- `PUT /api/routines/:id` — editar rutina
- `DELETE /api/routines/:id` — eliminar rutina

---

**Tarjeta 26**
- **Categoría:** BASE DE DATOS
- **Pregunta:** ¿Dónde se conecta la app a Supabase y con qué credenciales?
- **Respuesta:**
`server.ts` líneas iniciales — usando variables de entorno:
```typescript
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
```

---

**Tarjeta 27**
- **Categoría:** BASE DE DATOS
- **Pregunta:** ¿Qué relación existe entre `routines` y `exercises` en la base de datos actual?
- **Respuesta:**
La tabla `routines` tiene un campo `exercise_ids` (array) que almacena los IDs de los ejercicios. Al consultar una rutina individual (`GET /api/routines/:id`), el backend hace un segundo query a `exercises` usando `.in('id', routine.exercise_ids)` para resolver los datos completos.

---

### STACK TÉCNICO

**Tarjeta 28**
- **Categoría:** STACK TÉCNICO
- **Pregunta:** ¿Qué rol cumple cada archivo principal del proyecto?
- **Respuesta:**
| Archivo | Rol | Líneas |
|---------|-----|--------|
| `server.ts` | Backend: API REST con Express + TypeScript | ~330 |
| `index.html` | Frontend: pantalla de login/signup | ~157 |
| `dashboard.html` | Frontend: panel principal del usuario | ~175 |
| `style.css` | Estilos globales CSS | ~288 |

---

**Tarjeta 29**
- **Categoría:** STACK TÉCNICO
- **Pregunta:** ¿Qué tecnología se usa en cada capa de la arquitectura MVC?
- **Respuesta:**
| Capa | Tecnología |
|------|------------|
| Vista (Frontend) | React + TypeScript (diseño); HTML/CSS/JS (implementación actual) |
| Controlador (Lógica) | React Context + hooks / Express controllers |
| Modelo (Datos) | Objetos TypeScript + Supabase (PostgreSQL) |
| Estilos | CSS Modules o TailwindCSS |

---

**Tarjeta 30**
- **Categoría:** STACK TÉCNICO
- **Pregunta:** ¿Qué es FitCore y cuál es su arquitectura general?
- **Respuesta:**
**FitCore** es una SPA (Single Page Application) para gestionar rutinas de entrenamiento, construida con **React + TypeScript** bajo arquitectura **MVC**.
- **2 roles**: Admin (catálogo completo + ver todos los usuarios) y Usuario (solo sus rutinas).
- **Login simulado**: el usuario elige el rol al entrar, sin autenticación real basada en credenciales de rol.
- **Core del sistema**: módulo de creación/edición de rutinas con asignación automática de nivel.

---

## Notas finales para Claude

- Los bloques de código deben verse bien formateados en las respuestas de las tarjetas.
- El archivo debe ser un solo `.html` sin dependencias externas (sin CDN de fuentes si es posible, o si usas Google Fonts está bien).
- No uses frameworks JS externos (sin React, sin Vue) — solo HTML, CSS y JavaScript vanilla.
- El resultado debe poder abrirse directamente en el navegador con doble clic.
