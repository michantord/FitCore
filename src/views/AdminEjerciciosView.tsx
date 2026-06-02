import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Ejercicio, Nivel } from '../models/types';
import { ejercicioService } from '../services/ejercicioService';

const GRUPOS       = ['Piernas', 'Pecho', 'Espalda', 'Brazos', 'Core', 'Cardio', 'Hombros'];
const DIFICULTADES = ['basico', 'medio', 'alto'] as const;
const NIVELES: (Nivel | '')[] = ['', 'Principiante', 'Intermedio', 'Avanzado'];

const vacío: Omit<Ejercicio, 'id'> = { nombre: '', grupo_muscular: GRUPOS[0], dificultad: 'basico', activo: true, nivel_recomendado: null };

export default function AdminEjerciciosView() {
  const { ejercicios, rutinas, refreshEjercicios } = useApp();

  // Contar cuántas rutinas usan cada ejercicio
  const usosPorEjercicio = rutinas.reduce<Record<number, number>>((acc, r) => {
    r.rutina_ejercicio?.forEach(({ ejercicio_id }) => {
      acc[ejercicio_id] = (acc[ejercicio_id] ?? 0) + 1;
    });
    return acc;
  }, {});

  const topEjercicios = [...ejercicios]
    .filter((e) => (usosPorEjercicio[e.id] ?? 0) > 0)
    .sort((a, b) => (usosPorEjercicio[b.id] ?? 0) - (usosPorEjercicio[a.id] ?? 0))
    .slice(0, 5);

  const sinUso = ejercicios.filter((e) => !usosPorEjercicio[e.id]);
  const [form, setForm]       = useState<Omit<Ejercicio, 'id'> | null>(null);
  const [editId, setEditId]   = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [filtro, setFiltro]   = useState('');

  const filtrados = ejercicios.filter(
    (e) => e.nombre.toLowerCase().includes(filtro.toLowerCase()) || e.grupo_muscular.toLowerCase().includes(filtro.toLowerCase())
  );

  const abrirNuevo  = () => { setForm({ ...vacío }); setEditId(null); };
  const abrirEditar = (ej: Ejercicio) => { setForm({ nombre: ej.nombre, grupo_muscular: ej.grupo_muscular, dificultad: ej.dificultad, activo: ej.activo, nivel_recomendado: ej.nivel_recomendado }); setEditId(ej.id); };
  const cancelar    = () => { setForm(null); setEditId(null); setError(null); };

  const guardar = async () => {
    if (!form || !form.nombre.trim()) return;
    setGuardando(true); setError(null);
    try {
      if (editId !== null) await ejercicioService.update(editId, form);
      else await ejercicioService.create(form);
      await refreshEjercicios();
      cancelar();
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const toggle  = async (ej: Ejercicio) => { await ejercicioService.toggleActivo(ej.id, !ej.activo); await refreshEjercicios(); };
  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este ejercicio?')) return;
    await ejercicioService.delete(id);
    await refreshEjercicios();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, letterSpacing: '-0.01em', color: '#F0F2FF', margin: 0 }}>
          Catálogo de ejercicios
        </h2>
        <button
          onClick={abrirNuevo}
          className="text-sm px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
          style={{ background: '#C8F84A', color: '#0E1014', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}
        >
          + Agregar
        </button>
      </div>

      {/* Estadísticas */}
      {rutinas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Más usados */}
          <div className="bg-surface border border-steel rounded-xl p-4">
            <p className="text-xs uppercase tracking-widest text-dim mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>
              Más usados en rutinas
            </p>
            {topEjercicios.length === 0 ? (
              <p className="text-dim text-sm">Ningún ejercicio en rutinas aún.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {topEjercicios.map((e, i) => {
                  const usos = usosPorEjercicio[e.id] ?? 0;
                  const max  = usosPorEjercicio[topEjercicios[0].id] ?? 1;
                  return (
                    <div key={e.id} className="flex items-center gap-2">
                      <span className="text-dim w-4 text-xs text-right flex-shrink-0" style={{ fontFamily: 'DM Mono, monospace' }}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-white text-xs truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>{e.nombre}</span>
                          <span className="text-volt text-xs ml-2 flex-shrink-0" style={{ fontFamily: 'DM Mono, monospace' }}>
                            {usos} rutina{usos !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="h-1 bg-steel rounded-full overflow-hidden">
                          <div
                            className="h-full bg-volt rounded-full"
                            style={{ width: `${(usos / max) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sin uso */}
          <div className="bg-surface border border-steel rounded-xl p-4">
            <p className="text-xs uppercase tracking-widest text-dim mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>
              Sin uso en rutinas
              <span className="ml-2 text-warn">{sinUso.length}</span>
            </p>
            {sinUso.length === 0 ? (
              <p className="text-dim text-sm">Todos los ejercicios están en uso.</p>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                {sinUso.map((e) => (
                  <div key={e.id} className="flex items-center justify-between">
                    <span className="text-dim text-xs truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>{e.nombre}</span>
                    {!e.activo && (
                      <span className="text-xs text-steel ml-2 flex-shrink-0" style={{ fontFamily: 'DM Mono, monospace' }}>inactivo</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <input
        type="text"
        placeholder="Buscar por nombre o grupo muscular…"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="w-full bg-surface border border-steel rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-dim focus:outline-none focus:border-volt transition-colors mb-5"
      />

      {/* Formulario */}
      {form !== null && (
        <div className="bg-surface border border-volt/40 rounded-xl p-5 mb-5">
          <p className="text-dim text-xs mb-4" style={{ fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {editId !== null ? 'Editar ejercicio' : 'Nuevo ejercicio'}
          </p>
          {error && <p className="text-danger text-sm mb-3">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-dim text-xs block mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>Nombre</label>
              <input
                type="text" value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full bg-night border border-steel rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-volt"
              />
            </div>
            <div>
              <label className="text-dim text-xs block mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>Grupo muscular</label>
              <select
                value={form.grupo_muscular}
                onChange={(e) => setForm({ ...form, grupo_muscular: e.target.value })}
                className="w-full bg-night border border-steel rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-volt"
              >
                {GRUPOS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-dim text-xs block mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>Dificultad</label>
              <select
                value={form.dificultad}
                onChange={(e) => setForm({ ...form, dificultad: e.target.value as any })}
                className="w-full bg-night border border-steel rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-volt"
              >
                {DIFICULTADES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-dim text-xs block mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>Nivel recomendado</label>
              <select
                value={form.nivel_recomendado ?? ''}
                onChange={(e) => setForm({ ...form, nivel_recomendado: (e.target.value as Nivel) || null })}
                className="w-full bg-night border border-steel rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-volt"
              >
                {NIVELES.map((n) => <option key={n} value={n}>{n === '' ? '— Sin asignar —' : n}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  className="w-4 h-4 accent-volt"
                />
                <span className="text-sm text-white">Activo</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={guardar} disabled={guardando}
              className="text-sm px-4 py-2 rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: '#C8F84A', color: '#0E1014', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}
            >
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              onClick={cancelar}
              className="text-sm px-4 py-2 rounded-lg border border-steel text-dim hover:border-volt/40 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-2">
        {filtrados.map((ej) => (
          <div
            key={ej.id}
            className="bg-surface border border-steel rounded-xl p-3 flex items-center gap-3 transition-colors"
            style={{ opacity: ej.activo ? 1 : 0.5 }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#F0F2FF' }}>{ej.nombre}</span>
                <DificultadBadge d={ej.dificultad} />
                {ej.nivel_recomendado && <NivelRecomendadoBadge nivel={ej.nivel_recomendado} />}
                {!ej.activo && (
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 100, background: 'rgba(108,115,146,0.15)', color: '#6C7392', border: '0.5px solid rgba(108,115,146,0.3)' }}>
                    Inactivo
                  </span>
                )}
              </div>
              <p className="text-dim text-xs mt-0.5" style={{ fontFamily: 'DM Mono, monospace' }}>{ej.grupo_muscular}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => toggle(ej)}
                className="text-xs px-2.5 py-1 rounded-lg border transition-colors"
                style={ej.activo
                  ? { borderColor: 'rgba(245,158,11,0.3)', color: '#F59E0B' }
                  : { borderColor: 'rgba(200,248,74,0.3)', color: '#C8F84A' }
                }
              >
                {ej.activo ? 'Desactivar' : 'Activar'}
              </button>
              <button
                onClick={() => abrirEditar(ej)}
                className="text-xs px-2.5 py-1 rounded-lg border border-ice/20 text-ice hover:border-ice/50 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => eliminar(ej.id)}
                className="text-xs px-2.5 py-1 rounded-lg border border-danger/20 text-danger hover:border-danger/50 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NivelRecomendadoBadge({ nivel }: { nivel: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Principiante: { bg: 'rgba(34,197,94,0.12)',  color: '#22C55E' },
    Intermedio:   { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
    Avanzado:     { bg: 'rgba(255,77,77,0.12)',  color: '#FF4D4D' },
  };
  const s = map[nivel] ?? { bg: 'transparent', color: '#6C7392' };
  return (
    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 100, background: s.bg, color: s.color }}>
      {nivel}
    </span>
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
