import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { perfilFisicoService } from '../services/perfilFisicoService';
import { clasificarUsuario } from '../controllers/SugerenciaController';
import type { ExperienciaGym, ActividadActual, Objetivo, PerfilFisico } from '../models/types';

const EXPERIENCIA_LABELS: Record<ExperienciaGym, string> = {
  nunca:     'Nunca he ido al gimnasio',
  ocasional: 'He ido alguna vez',
  regular:   'Voy regularmente',
  avanzado:  'Entreno de forma avanzada',
};

const ACTIVIDAD_LABELS: Record<ActividadActual, string> = {
  sedentario: 'Sedentario (trabajo sentado, poco movimiento)',
  activo:     'Activo (camino bastante, actividad moderada)',
  muy_activo: 'Muy activo (deporte frecuente o trabajo físico)',
};

const OBJETIVO_LABELS: Record<Objetivo, string> = {
  perder_peso:   'Perder peso',
  ganar_musculo: 'Ganar músculo',
  tonificar:     'Tonificar',
  resistencia:   'Mejorar resistencia',
};

export default function PerfilFisicoView() {
  const { usuarioActual, perfilFisico, refreshPerfilFisico } = useApp();
  const navigate = useNavigate();

  const [experiencia, setExperiencia] = useState<ExperienciaGym>(
    perfilFisico?.experiencia ?? 'nunca'
  );
  const [actividad, setActividad] = useState<ActividadActual>(
    perfilFisico?.actividad_actual ?? 'sedentario'
  );
  const [objetivo, setObjetivo] = useState<Objetivo>(
    perfilFisico?.objetivo ?? 'tonificar'
  );
  const [edad, setEdad] = useState<string>(perfilFisico?.edad?.toString() ?? '');
  const [peso, setPeso] = useState<string>(perfilFisico?.peso_kg?.toString() ?? '');
  const [altura, setAltura] = useState<string>(perfilFisico?.altura_cm?.toString() ?? '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!usuarioActual) return null;

  const nivelPreview = clasificarUsuario({
    usuario_id: usuarioActual.id,
    experiencia,
    actividad_actual: actividad,
    objetivo,
    edad: edad ? Number(edad) : null,
    peso_kg: peso ? Number(peso) : null,
    altura_cm: altura ? Number(altura) : null,
  });

  const nivelColor: Record<string, string> = {
    Principiante: 'text-win border-win/30 bg-win/10',
    Intermedio:   'text-warn border-warn/30 bg-warn/10',
    Avanzado:     'text-danger border-danger/30 bg-danger/10',
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      const payload: PerfilFisico = {
        usuario_id:      usuarioActual.id,
        experiencia,
        actividad_actual: actividad,
        objetivo,
        edad:      edad   ? Number(edad)   : null,
        peso_kg:   peso   ? Number(peso)   : null,
        altura_cm: altura ? Number(altura) : null,
      };
      await perfilFisicoService.upsert(payload);
      await refreshPerfilFisico();
      navigate('/rutinas');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
          Tu perfil físico
        </h1>
        <p className="text-dim text-sm mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Con estos datos te sugeriremos ejercicios adecuados para tu nivel.
        </p>
      </div>

      {/* Nivel preview */}
      <div className={`border rounded-xl px-4 py-3 flex items-center gap-3 ${nivelColor[nivelPreview]}`}>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'DM Mono, monospace' }}>
          Nivel detectado
        </span>
        <span className="text-sm font-semibold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          {nivelPreview}
        </span>
      </div>

      {/* Experiencia */}
      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-widest text-dim" style={{ fontFamily: 'DM Mono, monospace' }}>
          Experiencia en el gym
        </label>
        <div className="flex flex-col gap-2">
          {(Object.entries(EXPERIENCIA_LABELS) as [ExperienciaGym, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setExperiencia(val)}
              className={`text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                experiencia === val
                  ? 'border-volt bg-volt/10 text-volt'
                  : 'border-steel bg-surface text-white hover:border-volt/50'
              }`}
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Actividad actual */}
      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-widest text-dim" style={{ fontFamily: 'DM Mono, monospace' }}>
          Actividad física actual
        </label>
        <div className="flex flex-col gap-2">
          {(Object.entries(ACTIVIDAD_LABELS) as [ActividadActual, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setActividad(val)}
              className={`text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                actividad === val
                  ? 'border-volt bg-volt/10 text-volt'
                  : 'border-steel bg-surface text-white hover:border-volt/50'
              }`}
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Objetivo */}
      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-widest text-dim" style={{ fontFamily: 'DM Mono, monospace' }}>
          Objetivo
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(OBJETIVO_LABELS) as [Objetivo, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setObjetivo(val)}
              className={`px-4 py-3 rounded-xl border text-sm transition-colors ${
                objetivo === val
                  ? 'border-volt bg-volt/10 text-volt'
                  : 'border-steel bg-surface text-white hover:border-volt/50'
              }`}
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Datos opcionales */}
      <div className="flex flex-col gap-3">
        <label className="text-xs uppercase tracking-widest text-dim" style={{ fontFamily: 'DM Mono, monospace' }}>
          Datos adicionales (opcional)
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Edad', val: edad, set: setEdad, placeholder: 'años' },
            { label: 'Peso', val: peso, set: setPeso, placeholder: 'kg' },
            { label: 'Altura', val: altura, set: setAltura, placeholder: 'cm' },
          ].map(({ label, val, set, placeholder }) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-xs text-dim" style={{ fontFamily: 'DM Mono, monospace' }}>{label}</span>
              <input
                type="number"
                value={val}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="bg-surface border border-steel rounded-lg px-3 py-2 text-sm text-white placeholder-dim focus:outline-none focus:border-volt"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              />
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-danger text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>{error}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => navigate('/rutinas')}
          className="flex-1 px-4 py-3 rounded-xl border border-steel text-dim hover:text-white transition-colors text-sm"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="flex-1 px-4 py-3 rounded-xl bg-volt text-night font-semibold text-sm disabled:opacity-50 transition-opacity"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          {guardando ? 'Guardando…' : 'Guardar perfil'}
        </button>
      </div>
    </div>
  );
}
