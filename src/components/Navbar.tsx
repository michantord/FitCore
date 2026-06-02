import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { usuarioActual, logout } = useApp();

  return (
    <nav className="bg-surface border-b border-steel px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#C8F84A', letterSpacing: '-0.02em' }}>
          FitCore
        </span>
        {usuarioActual?.rol === 'admin' && (
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.1em' }}
            className="bg-ice/10 text-ice border border-ice/20 px-2 py-0.5 rounded-full uppercase">
            Admin
          </span>
        )}
      </div>
      {usuarioActual && (
        <div className="flex items-center gap-4">
          <span className="text-dim text-sm">{usuarioActual.nombre}</span>
          <button
            onClick={logout}
            className="text-sm text-dim border border-steel hover:border-volt hover:text-volt px-3 py-1 rounded-lg transition-colors"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Salir
          </button>
        </div>
      )}
    </nav>
  );
}
