import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Ejercicio, RutinaEjercicio } from '../models/types';
import { rutinaService } from '../services/rutinaService';
import { calcularNivel, estaCompleta } from '../controllers/RutinaController';
import { clasificarUsuario, getSugerencias } from '../controllers/SugerenciaController';
import NivelBadge from '../components/NivelBadge';

export default function EditorRutinaView() {
  const { id } = useParams<{ id: string }>();
  const isNew  = !id;
  const navigate = useNavigate();
  const { usuarioActual, ejercicios, rutinas, perfilFisico, refreshRutinas } = useApp();

  const rutinaExistente = rutinas.find((r) => r.id === Number(id));

  const [nombre, setNombre]         = useState('');
  const [frecuencia, setFrecuencia] = useState(3);
  const [seleccionados, setSeleccionados] = useState<(RutinaEjercicio & { ejercicio?: Ejercicio })[]>([]);
  const [mostrarCatalogo, setMostrarCatalogo] = useState(false);
  const [guardando, setGuardando]   = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    if (rutinaExistente) {
      setNombre(rutinaExistente.nombre);
      setFrecuencia(rutinaExistente.frecuencia_semanal);
      setSeleccionados(rutinaExistente.rutina_ejercicio ?? []);
    }
  }, [rutinaExistente]);

  const nivel    = calcularNivel(frecuencia, seleccionados);
  const completa = estaCompleta(seleccionados);

  const nivelUsuario = perfilFisico ? clasificarUsuario(perfilFisico) : null;
  const sugeridos = nivelUsuario
    ? getSugerencias(nivelUsuario, ejercicios).filter(
        (e) => !seleccionados.some((s) => s.ejercicio_id === e.id)
      )
    : [];

  const agregarEjercicio = (ej: Ejercicio) => {
    if (!ej.activo) return;
    if (seleccionados.find((s) => s.ejercicio_id === ej.id)) return;
    setSeleccionados((prev) => [...prev, {
      rutina_id: Number(id) || 0,
      ejercicio_id: ej.id,
      series: 3,
      repeticiones: 10,
      ejercicio: ej,
    }]);
    setMostrarCatalogo(false);
  };

  const quitarEjercicio = (ejercicioId: number) =>
    setSeleccionados((prev) => prev.filter((s) => s.ejercicio_id !== ejercicioId));

  const actualizarSeries = (ejercicioId: number, campo: 'series' | 'repeticiones', valor: number) =>
    setSeleccionados((prev) => prev.map((s) => s.ejercicio_id === ejercicioId ? { ...s, [campo]: valor } : s));

  const guardar = async () => {
    if (!completa || !usuarioActual) return;
    setGuardando(true);
    setError(null);
    try {
      let rutinaId: number;
      if (isNew) {
        const nueva = await rutinaService.create({ usuario_id: usuarioActual.id, nombre, nivel, frecuencia_semanal: frecuencia, activa: true });
        rutinaId = nueva.id;
      } else {
        await rutinaService.update(Number(id), { nombre, nivel, frecuencia_semanal: frecuencia });
        rutinaId = Number(id);
      }
      await rutinaService.setEjercicios(rutinaId, seleccionados.map(({ ejercicio_id, series, repeticiones }) => ({ rutina_id: rutinaId, ejercicio_id, series, repeticiones })));
      await refreshRutinas();
      navigate('/rutinas');
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/rutinas')} className="text-dim hover:text-volt text-sm transition-colors">
          ← Volver
        </button>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#F0F2FF', margin: 0 }}>
          {isNew ? 'Nueva rutina' : 'Editar rutina'}
        </h2>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg p-3 text-sm mb-4">{error}</div>
      )}

      <div className="bg-surface border border-steel rounded-xl p-5 space-y-6">

        {/* Nombre */}
        <div>
          <label className="block text-dim text-xs mb-2" style={{ fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Nombre
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Full body 3x"
            className="w-full bg-night border border-steel rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-steel focus:outline-none focus:border-volt transition-colors"
          />
        </div>

        {/* Frecuencia */}
        <div>
          <label className="block text-dim text-xs mb-3" style={{ fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Frecuencia semanal —{' '}
            <span style={{ color: '#C8F84A' }}>{frecuencia} días</span>
          </label>
          <div className="flex gap-2">
            {diasSemana.map((dia, i) => (
              <button
                key={dia}
                onClick={() => setFrecuencia(i + 1)}
                className="w-9 h-9 rounded-full text-xs font-semibold transition-all"
                style={{
                  fontFamily: 'DM Mono, monospace',
                  background: i < frecuencia ? '#C8F84A' : '#2E3347',
                  color: i < frecuencia ? '#0E1014' : '#6C7392',
                }}
              >
                {dia}
              </button>
            ))}
          </div>
        </div>

        {/* Ejercicios */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-dim text-xs" style={{ fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Ejercicios ({seleccionados.length} / mín. 3)
            </label>
            <button
              onClick={() => setMostrarCatalogo((v) => !v)}
              className="text-xs text-volt hover:opacity-70 transition-opacity"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              + Agregar ejercicio
            </button>
          </div>

          {mostrarCatalogo && (
            <div className="bg-night border border-steel rounded-lg overflow-hidden mb-3 max-h-56 overflow-y-auto">
              {ejercicios.map((ej) => {
                const yaAgregado = seleccionados.some((s) => s.ejercicio_id === ej.id);
                return (
                  <button
                    key={ej.id}
                    onClick={() => agregarEjercicio(ej)}
                    disabled={!ej.activo || yaAgregado}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left border-b border-steel last:border-0 transition-colors"
                    style={{
                      opacity: !ej.activo ? 0.4 : yaAgregado ? 0.6 : 1,
                      cursor: !ej.activo || yaAgregado ? 'not-allowed' : 'pointer',
                      color: '#F0F2FF',
                    }}
                  >
                    <span>
                      <span className="font-medium">{ej.nombre}</span>
                      <span className="text-dim ml-2">{ej.grupo_muscular}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <DificultadBadge d={ej.dificultad} />
                      {!ej.activo && <span className="text-danger text-xs">Bloqueado</span>}
                      {yaAgregado && <span className="text-volt text-xs">✓</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="space-y-2">
            {seleccionados.map((re) => (
              <div key={re.ejercicio_id} className="flex items-center gap-2 bg-night border border-steel rounded-lg px-3 py-2">
                <span className="flex-1 text-sm" style={{ color: '#F0F2FF' }}>
                  {re.ejercicio?.nombre ?? `Ejercicio #${re.ejercicio_id}`}
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number" min={1} value={re.series}
                    onChange={(e) => actualizarSeries(re.ejercicio_id, 'series', Number(e.target.value))}
                    className="w-12 bg-surface border border-steel rounded px-2 py-1 text-xs text-center text-white focus:outline-none focus:border-volt"
                  />
                  <span className="text-dim text-xs">×</span>
                  <input
                    type="number" min={1} value={re.repeticiones}
                    onChange={(e) => actualizarSeries(re.ejercicio_id, 'repeticiones', Number(e.target.value))}
                    className="w-12 bg-surface border border-steel rounded px-2 py-1 text-xs text-center text-white focus:outline-none focus:border-volt"
                  />
                  <span className="text-dim text-xs">reps</span>
                </div>
                <button onClick={() => quitarEjercicio(re.ejercicio_id)} className="text-dim hover:text-danger transition-colors ml-1 text-sm">✕</button>
              </div>
            ))}
            {seleccionados.length === 0 && (
              <p className="text-dim text-sm text-center py-6">Agrega al menos 3 ejercicios</p>
            )}
          </div>
        </div>

        {/* Sugerencias */}
        {nivelUsuario && (
          <div className="border border-volt/20 rounded-xl p-4 bg-volt/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-volt" style={{ fontFamily: 'DM Mono, monospace' }}>
                Sugeridos para ti · {nivelUsuario}
              </span>
              <button
                onClick={() => navigate('/perfil')}
                className="text-xs text-dim hover:text-volt transition-colors"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Editar perfil →
              </button>
            </div>
            {sugeridos.length === 0 ? (
              <p className="text-dim text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Ya agregaste todos los ejercicios sugeridos para tu nivel.
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {sugeridos.map((ej) => (
                  <button
                    key={ej.id}
                    onClick={() => agregarEjercicio(ej)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-night border border-steel hover:border-volt/40 transition-colors text-left"
                  >
                    <span className="text-sm text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      {ej.nombre}
                      <span className="text-dim ml-2 text-xs">{ej.grupo_muscular}</span>
                    </span>
                    <span className="text-volt text-xs ml-2" style={{ fontFamily: 'DM Mono, monospace' }}>+ Agregar</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!perfilFisico && (
          <div className="border border-steel rounded-xl p-4 flex items-center justify-between">
            <p className="text-dim text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Completa tu perfil físico para recibir sugerencias de ejercicios.
            </p>
            <button
              onClick={() => navigate('/perfil')}
              className="text-xs px-3 py-1.5 rounded-lg border border-volt/40 text-volt hover:bg-volt/10 transition-colors flex-shrink-0 ml-3"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              Completar perfil
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-steel">
          <div className="flex items-center gap-2">
            <span className="text-dim text-xs" style={{ fontFamily: 'DM Mono, monospace' }}>Nivel calculado</span>
            <NivelBadge nivel={nivel} />
          </div>
          <button
            onClick={guardar}
            disabled={!completa || !nombre.trim() || guardando}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
            style={{ background: '#C8F84A', color: '#0E1014', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}
          >
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>

        {!completa && (
          <p className="text-warn text-xs text-center -mt-2">
            ⚠ Agrega al menos 3 ejercicios para guardar
          </p>
        )}
      </div>
    </div>
  );
}

function DificultadBadge({ d }: { d: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    basico: { bg: 'rgba(34,197,94,0.12)',  color: '#22C55E' },
    medio:  { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
    alto:   { bg: 'rgba(255,77,77,0.12)',  color: '#FF4D4D' },
  };
  const s = map[d] ?? { bg: 'transparent', color: '#6C7392' };
  return (
    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 100, background: s.bg, color: s.color }}>
      {d}
    </span>
  );
}
