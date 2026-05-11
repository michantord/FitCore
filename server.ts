import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// RUTAS DE LA API (BACKEND)
// ==========================================

// 1. Requisito: Validación en Backend de un dato sensible
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos.' });
  }

  // VALIDACIÓN ESTRICTA EN BACKEND:
  // Verificamos que la contraseña sea robusta antes de consultar cualquier BD
  // Debe tener mínimo 8 caracteres, al menos un número y un carácter especial.
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
  
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
      error: 'Validación Backend: La contraseña es demasiado débil o no cumple el formato requerido.' 
    });
  }

  // Simulación de validación con base de datos
  if (email === 'admin@fitcore.com' && password === 'Fitcore2026!') {
    return res.json({ success: true, message: 'Autenticación exitosa', token: 'token-seguro-123' });
  }

  return res.status(401).json({ error: 'Credenciales inválidas.' });
});

// 2. Requisito: Dropdown en Cascada (Referencias entre tablas)
// Simulación de base de datos relacional: Grupo Muscular -> Músculos
const muscleDatabase: Record<string, { id: string, name: string }[]> = {
  '1': [
    { id: 'm1', name: 'Pectorales' },
    { id: 'm2', name: 'Dorsales' },
    { id: 'm3', name: 'Deltoides (Hombros)' },
    { id: 'm4', name: 'Bíceps' },
    { id: 'm5', name: 'Tríceps' }
  ],
  '2': [
    { id: 'm6', name: 'Cuádriceps' },
    { id: 'm7', name: 'Isquiotibiales' },
    { id: 'm8', name: 'Glúteos' },
    { id: 'm9', name: 'Gemelos' }
  ],
  '3': [
    { id: 'm10', name: 'Abdominales Frontales' },
    { id: 'm11', name: 'Oblicuos' },
    { id: 'm12', name: 'Lumbares' }
  ]
};

// Endpoint para obtener los Grupos Musculares (Dropdown 1)
app.get('/api/muscle-groups', (req, res) => {
  const groups = [
    { id: '1', name: 'Tren Superior' },
    { id: '2', name: 'Tren Inferior' },
    { id: '3', name: 'Core / Zona Media' }
  ];
  res.json(groups);
});

// Endpoint para obtener los Músculos según el Grupo (Dropdown 2)
app.get('/api/muscles/:groupId', (req, res) => {
  const { groupId } = req.params;
  const muscles = muscleDatabase[groupId] || [];
  res.json(muscles);
});

// ==========================================
// INICIO DEL SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log(`Servidor Backend ejecutándose en http://localhost:${PORT}`);
});
