import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import LoginView from './views/LoginView';
import MisRutinasView from './views/MisRutinasView';
import EditorRutinaView from './views/EditorRutinaView';
import AdminEjerciciosView from './views/AdminEjerciciosView';
import AdminUsuariosView from './views/AdminUsuariosView';
import PerfilFisicoView from './views/PerfilFisicoView';

function AppContent() {
  const { usuarioActual } = useApp();

  if (!usuarioActual) return <LoginView />;

  const isAdmin = usuarioActual.rol === 'admin';

  return (
    <div className="min-h-screen bg-night flex flex-col">
      <Navbar />

      {isAdmin && (
        <div className="bg-surface border-b border-steel">
          <div className="max-w-3xl mx-auto flex gap-1 px-4 py-2">
            <TabLink to="/ejercicios">Ejercicios</TabLink>
            <TabLink to="/usuarios">Usuarios</TabLink>
          </div>
        </div>
      )}

      <main className="flex-1">
        <Routes>
          {isAdmin ? (
            <>
              <Route path="/ejercicios" element={<AdminEjerciciosView />} />
              <Route path="/usuarios"   element={<AdminUsuariosView />} />
              <Route path="*"           element={<Navigate to="/ejercicios" replace />} />
            </>
          ) : (
            <>
              <Route path="/rutinas"        element={<MisRutinasView />} />
              <Route path="/rutinas/nueva"  element={<EditorRutinaView />} />
              <Route path="/rutinas/:id"    element={<EditorRutinaView />} />
              <Route path="/perfil"         element={<PerfilFisicoView />} />
              <Route path="*"              element={<Navigate to="/rutinas" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}

function TabLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-4 py-1.5 text-sm rounded-lg transition-colors ${
          isActive ? 'text-volt bg-volt/10' : 'text-dim hover:text-white'
        }`
      }
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      {children}
    </NavLink>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
