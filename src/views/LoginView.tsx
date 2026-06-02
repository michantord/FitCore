import { useState } from 'react';
import { useApp } from '../context/AppContext';

type Tab = 'login' | 'register';

export default function LoginView() {
  const { login, register, authLoading } = useApp();
  const [tab, setTab]           = useState<Tab>('login');
  const [nombre, setNombre]     = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const cambiarTab = (t: Tab) => { setTab(t); setError(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    let err: string | null;
    if (tab === 'login') {
      err = await login(email, password);
    } else {
      if (!nombre.trim()) { setError('Ingresa tu nombre'); setCargando(false); return; }
      err = await register(email, password, nombre.trim());
    }
    if (err) setError(translateError(err));
    setCargando(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-night flex items-center justify-center">
        <span className="text-dim text-sm" style={{ fontFamily: 'DM Mono, monospace' }}>Cargando…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <p className="text-dim text-xs mb-3" style={{ fontFamily: 'DM Mono, monospace', letterSpacing: '0.15em' }}>
            BIENVENIDO A
          </p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 42, color: '#C8F84A', letterSpacing: '-0.02em', margin: 0 }}>
            FitCore
          </h1>
          <p className="text-dim text-sm mt-2">Gestiona tus rutinas de entrenamiento</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-steel rounded-2xl p-7">

          {/* Tabs */}
          <div className="flex mb-6 bg-night rounded-lg p-1">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => cambiarTab(t)}
                className="flex-1 py-1.5 rounded-md text-sm transition-colors"
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 500,
                  background: tab === t ? '#2E3347' : 'transparent',
                  color: tab === t ? '#F0F2FF' : '#6C7392',
                }}
              >
                {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-sm text-dim mb-1.5">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  placeholder="Tu nombre"
                  className="w-full bg-night border border-steel rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-steel focus:outline-none focus:border-volt transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-dim mb-1.5">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full bg-night border border-steel rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-steel focus:outline-none focus:border-volt transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-dim mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-night border border-steel rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-steel focus:outline-none focus:border-volt transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3 rounded-lg font-medium text-sm transition-opacity disabled:opacity-50"
              style={{ background: '#C8F84A', color: '#0E1014', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}
            >
              {cargando
                ? (tab === 'login' ? 'Entrando…' : 'Creando cuenta…')
                : (tab === 'login' ? 'Entrar' : 'Crear cuenta')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials'))  return 'Email o contraseña incorrectos';
  if (msg.includes('Email not confirmed'))         return 'Confirma tu email primero';
  if (msg.includes('Too many requests'))           return 'Demasiados intentos. Espera un momento';
  if (msg.includes('User already registered'))     return 'Este correo ya está registrado';
  if (msg.includes('Password should be'))          return 'La contraseña debe tener al menos 6 caracteres';
  return msg;
}
