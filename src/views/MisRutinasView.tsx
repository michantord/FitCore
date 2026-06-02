import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { RutinaConEjercicios } from '../models/types';
import { rutinaService } from '../services/rutinaService';
import { estaCompleta } from '../controllers/RutinaController';
import { clasificarUsuario } from '../controllers/SugerenciaController';
import NivelBadge from '../components/NivelBadge';

const OBJETIVO_LABELS: Record<string, string> = {
  perder_peso:   'Perder peso',
  ganar_musculo: 'Ganar músculo',
  tonificar:     'Tonificar',
  resistencia:   'Resistencia',
};

const ACTIVIDAD_LABELS: Record<string, string> = {
  sedentario: 'Sedentario',
  activo:     'Activo',
  muy_activo: 'Muy activo',
};

export default function MisRutinasView() {
  const { usuarioActual, perfilFisico, rutinas, refreshRutinas } = useApp();
  const navigate = useNavigate();

  const nivelUsuario = perfilFisico ? clasificarUsuario(perfilFisico) : null;

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta rutina?')) return;
    await rutinaService.delete(id);
    await refreshRutinas();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

      {/* Bienvenida */}
      <div>
        <p className="text-dim text-xs uppercase tracking-widest mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>
          Bienvenido de vuelta
        </p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#F0F2FF', margin: 0, letterSpacing: '-0.01em' }}>
          {usuarioActual?.nombre ?? 'Atleta'} 👋
        </h1>
      </div>

      {/* Card de datos personales */}
      <div className="bg-surface border border-steel rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-widest text-dim" style={{ fontFamily: 'DM Mono, monospace' }}>
            Datos personales
          </span>
          {perfilFisico && (
            <button
              onClick={() => navigate('/perfil')}
              className="text-xs text-volt hover:opacity-70 transition-opacity"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              Editar →
            </button>
          )}
        </div>

        {perfilFisico ? (
          <div className="flex flex-wrap gap-3">
            {nivelUsuario && (
              <Stat label="Nivel" value={<NivelBadge nivel={nivelUsuario} />} />
            )}
            <Stat label="Objetivo" value={OBJETIVO_LABELS[perfilFisico.objetivo]} />
            <Stat label="Actividad" value={ACTIVIDAD_LABELS[perfilFisico.actividad_actual]} />
            {perfilFisico.edad && <Stat label="Edad" value={`${perfilFisico.edad} años`} />}
            {perfilFisico.peso_kg && <Stat label="Peso" value={`${perfilFisico.peso_kg} kg`} />}
            {perfilFisico.altura_cm && <Stat label="Altura" value={`${perfilFisico.altura_cm} cm`} />}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="text-dim text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Aún no has agregado tu información personal.
            </p>
            <button
              onClick={() => navigate('/perfil')}
              className="flex-shrink-0 px-4 py-2 rounded-xl border border-volt/40 text-volt text-sm hover:bg-volt/10 transition-colors"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              + Agregar info
            </button>
          </div>
        )}
      </div>

      {/* Sección rutinas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#F0F2FF', margin: 0 }}>
            Mis rutinas
          </h2>
          {perfilFisico && (
            <button
              onClick={() => navigate('/rutinas/nueva')}
              className="text-sm px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
              style={{ background: '#C8F84A', color: '#0E1014', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}
            >
              + Nueva
            </button>
          )}
        </div>

        {!perfilFisico ? (
          <div className="bg-surface border border-steel rounded-2xl p-6 text-center">
            <p className="text-dim text-sm mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Agrega tus datos personales antes de empezar a crear rutinas.
            </p>
            <p className="text-dim text-xs" style={{ fontFamily: 'DM Mono, monospace' }}>
              Así podremos sugerirte ejercicios adecuados para ti.
            </p>
          </div>
        ) : rutinas.length === 0 ? (
          <div className="text-center py-16 text-dim">
            <p style={{ fontSize: 36, marginBottom: 10 }}>📋</p>
            <p className="text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>No tienes rutinas todavía.</p>
            <p className="text-sm mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>Crea una para empezar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rutinas.map((r) => (
              <RutinaCard key={r.id} rutina={r} onEliminar={eliminar} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 bg-night rounded-xl px-4 py-3 min-w-[90px]">
      <span className="text-dim" style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span className="text-white text-sm font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        {value}
      </span>
    </div>
  );
}

function RutinaCard({ rutina, onEliminar }: { rutina: RutinaConEjercicios; onEliminar: (id: number) => void }) {
  const navigate = useNavigate();
  const completa = estaCompleta(rutina.rutina_ejercicio ?? []);
  const count    = rutina.rutina_ejercicio?.length ?? 0;
  const tieneInactivos = rutina.rutina_ejercicio?.some((re) => re.ejercicio && !re.ejercicio.activo);

  return (
    <div className="bg-surface border border-steel rounded-xl p-4 flex items-start justify-between gap-3 hover:border-volt/40 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F0F2FF' }}>
            {rutina.nombre}
          </span>
          {completa
            ? <NivelBadge nivel={rutina.nivel} />
            : (
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 100, background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '0.5px solid rgba(245,158,11,0.3)' }}>
                ⚠ Incompleta
              </span>
            )
          }
        </div>
        <p className="text-dim text-xs" style={{ fontFamily: 'DM Mono, monospace' }}>
          {count} ejercicio{count !== 1 ? 's' : ''} · {rutina.frecuencia_semanal} días/sem
        </p>
        {tieneInactivos && (
          <p className="text-danger text-xs mt-1">⚠ Contiene ejercicios bloqueados</p>
        )}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => navigate(`/rutinas/${rutina.id}`)}
          className="text-xs text-ice border border-ice/20 hover:border-ice/50 px-3 py-1.5 rounded-lg transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onEliminar(rutina.id)}
          className="text-xs text-danger border border-danger/20 hover:border-danger/50 px-3 py-1.5 rounded-lg transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
