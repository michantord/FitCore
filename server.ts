import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Faltan las variables de entorno SUPABASE_URL o SUPABASE_KEY en el archivo .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// RUTAS DE LA API (RESPALDO EN SUPABASE)
// ==========================================

// 1. Autenticación (Login)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos.' });
  }

  try {
    // Autenticar usando la funcionalidad nativa de Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user) {
      return res.status(401).json({ error: error?.message || 'Credenciales inválidas.' });
    }

    return res.json({ 
      success: true, 
      message: 'Autenticación exitosa', 
      token: data.session?.access_token || ('token-seguro-' + data.user.id)
    });
  } catch (err: any) {
    console.error('Error en Login:', err);
    return res.status(500).json({ error: 'Error interno del servidor al autenticar.' });
  }
});

// 1.5. Registro (Sign Up)
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos.' });
  }

  // VALIDACIÓN ESTRICTA EN BACKEND:
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*.])[\w!@#$%^&*.]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
      error: 'Validación Backend: La contraseña debe tener al menos 8 caracteres, incluir un número y un carácter especial (!@#$%^&*.).' 
    });
  }

  try {
    // Registrar el usuario en la funcionalidad nativa de Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data.user) {
      return res.status(500).json({ error: 'No se pudo crear el usuario.' });
    }

    // Si inicia sesión automáticamente tras registrarse
    if (data.session) {
      return res.json({
        success: true,
        message: 'Registro exitoso e inicio de sesión automático.',
        token: data.session.access_token
      });
    } else {
      // Si requiere confirmación
      return res.json({
        success: true,
        message: 'Registro exitoso. Por favor verifica tu correo si la confirmación está activa.',
        token: 'token-temp-' + data.user.id
      });
    }
  } catch (err: any) {
    console.error('Error en Registro:', err);
    return res.status(500).json({ error: 'Error interno del servidor al registrar.' });
  }
});

// 2. Obtener los Grupos Musculares (Dropdown 1)
app.get('/api/muscle-groups', async (req, res) => {
  try {
    const { data: groups, error } = await supabase
      .from('muscle_groups')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw error;
    }

    res.json(groups);
  } catch (err: any) {
    console.error('Error cargando grupos musculares:', err);
    res.status(500).json({ error: 'Error cargando grupos musculares: ' + err.message });
  }
});

// 3. Obtener los Músculos según el Grupo (Dropdown 2)
app.get('/api/muscles/:groupId', async (req, res) => {
  const { groupId } = req.params;

  try {
    const { data: muscles, error } = await supabase
      .from('muscles')
      .select('*')
      .eq('group_id', groupId)
      .order('id', { ascending: true });

    if (error) {
      throw error;
    }

    res.json(muscles);
  } catch (err: any) {
    console.error('Error cargando músculos:', err);
    res.status(500).json({ error: 'Error cargando músculos: ' + err.message });
  }
});

// 4. Registrar un nuevo ejercicio
app.post('/api/exercises', async (req, res) => {
  const { name, groupId, muscleId } = req.body;
  
  if (!name || !groupId || !muscleId) {
    return res.status(400).json({ error: 'Faltan datos requeridos.' });
  }

  try {
    // Insertar el nuevo ejercicio en Supabase
    const { data: newExercise, error } = await supabase
      .from('exercises')
      .insert({ 
        name, 
        group_id: groupId, 
        muscle_id: muscleId 
      })
      .select('id, name, muscle_groups(name), muscles(name)')
      .single();

    if (error) {
      throw error;
    }

    // Darle formato a la respuesta para coincidir con lo que espera el frontend
    const formattedExercise = {
      id: newExercise.id,
      name: newExercise.name,
      groupName: newExercise.muscle_groups ? (newExercise.muscle_groups as any).name : 'Desconocido',
      muscleName: newExercise.muscles ? (newExercise.muscles as any).name : 'Desconocido'
    };

    res.json({ success: true, exercise: formattedExercise });
  } catch (err: any) {
    console.error('Error registrando ejercicio:', err);
    res.status(500).json({ error: 'Error registrando ejercicio: ' + err.message });
  }
});

// 5. Obtener lista de todos los ejercicios registrados
app.get('/api/exercises', async (req, res) => {
  try {
    const { data: dbExercises, error } = await supabase
      .from('exercises')
      .select('id, name, muscle_groups(name), muscles(name)')
      .order('id', { ascending: true });

    if (error) {
      throw error;
    }

    const formatted = (dbExercises || []).map(ex => ({
      id: ex.id,
      name: ex.name,
      groupName: ex.muscle_groups ? (ex.muscle_groups as any).name : 'Desconocido',
      muscleName: ex.muscles ? (ex.muscles as any).name : 'Desconocido'
    }));

    res.json(formatted);
  } catch (err: any) {
    console.error('Error obteniendo ejercicios:', err);
    res.status(500).json({ error: 'Error obteniendo ejercicios: ' + err.message });
  }
});

// ==========================================
// NUEVOS ENDPOINTS: RUTINAS DE ENTRENAMIENTO
// ==========================================

// 6. Obtener lista de rutinas
app.get('/api/routines', async (req, res) => {
  try {
    const { data: dbRoutines, error } = await supabase
      .from('routines')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw error;
    }

    res.json(dbRoutines);
  } catch (err: any) {
    console.error('Error al obtener rutinas:', err);
    res.status(500).json({ error: 'Error al obtener rutinas: ' + err.message });
  }
});

// 7. Obtener una rutina individual detallada (resolviendo sus ejercicios)
app.get('/api/routines/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data: routine, error: routineError } = await supabase
      .from('routines')
      .select('*')
      .eq('id', id)
      .single();

    if (routineError || !routine) {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }

    // Obtener los detalles completos de los ejercicios usando el array de IDs
    let exercisesList: any[] = [];
    if (routine.exercise_ids && routine.exercise_ids.length > 0) {
      const { data: dbExercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('id, name, muscle_groups(name), muscles(name)')
        .in('id', routine.exercise_ids);
      
      if (!exercisesError && dbExercises) {
        exercisesList = dbExercises.map(ex => ({
          id: ex.id,
          name: ex.name,
          groupName: ex.muscle_groups ? (ex.muscle_groups as any).name : 'Desconocido',
          muscleName: ex.muscles ? (ex.muscles as any).name : 'Desconocido'
        }));
      }
    }

    res.json({
      ...routine,
      exercises: exercisesList
    });
  } catch (err: any) {
    console.error('Error al obtener detalle de rutina:', err);
    res.status(500).json({ error: 'Error al obtener detalle de rutina: ' + err.message });
  }
});

// 8. Crear una nueva rutina
app.post('/api/routines', async (req, res) => {
  const { name, difficulty, duration_minutes, status, progress, exercise_ids, user_id } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'El nombre de la rutina es requerido.' });
  }

  try {
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
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ success: true, routine: newRoutine });
  } catch (err: any) {
    console.error('Error al registrar rutina:', err);
    res.status(500).json({ error: 'Error al registrar rutina: ' + err.message });
  }
});

// ==========================================
// INICIO DEL SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log(`Servidor Backend ejecutándose en http://localhost:${PORT}`);
});
