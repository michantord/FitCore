import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { RutinaConEjercicios, PerfilFisico } from '../models/types';
import { clasificarUsuario } from '../controllers/SugerenciaController';
import NivelBadge from '../components/NivelBadge';

const OBJETIVO_LABELS: Record<string, string> = {
  perder_peso:   'Perder peso',
  ganar_musculo: 'Ganar músculo',
  tonificar:     'Tonificar',
  resistencia:   'Resistencia',
};

const EXPERIENCIA_LABELS: Record<string, string> = {
  nunca:     'Sin experiencia',
  ocasional: 'Ocasional',
  regular:   'Regular',
  avanzado:  'Avanzado',
};

const ACTIVIDAD_LABELS: Record<string, string> = {
  sedentario: 'Sedentario',
  activo:     'Activo',
  muy_activo: 'Muy activo',
};

export default function AdminUsuariosView() {
  const { profiles, rutinas, perfilesFisicos } = useApp();
  const [expandido, setExpandido] = useState<string | null>(null);

  const usuariosNormales = profiles.filter((p) => p.rol === 'usuario');

  const rutinasPorUsuario = (id: string): RutinaConEjercicios[] =>
    rutinas.filter((r) => r.usuario_id === id);

  const perfilDe = (id: string): PerfilFisico | undefined =>
    perfilesFisicos.find((p) => p.usuario_id === id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, letterSpacing: '-0.01em', color: '#F0F2FF', margin: '0 0 20px' }}>
        Usuarios y sus rutinas
      </h2>

      {usuariosNormales.length === 0 ? (
        <p className="text-dim text-center py-12">No hay usuarios registrados aún.</p>
      ) : (
        <div className="space-y-4">
          {usuariosNormales.map((u) => {
            const sus    = rutinasPorUsuario(u.id);
            const perfil = perfilDe(u.id);
            const nivel  = perfil ? clasificarUsuario(perfil) : null;
            const abierto = expandido === u.id;

            return (
              <div key={u.id} className="bg-surface border border-steel rounded-xl overflow-hidden">

                {/* Cabecera del usuario */}
                <button
                  onClick={() => setExpandido(abierto ? null : u.id)}
                  className="w-full px-4 py-3 border-b border-steel flex items-center gap-3 hover:bg-night/40 transition-colors text-left"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: 'rgba(200,248,74,0.12)', color: '#C8F84A', fontFamily: 'Syne, sans-serif' }}
                  >
                    {u.nombre[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#F0F2FF', fontSize: 15 }}>
                        {u.nombre}
                      </span>
                      {nivel && <NivelBadge nivel={nivel} />}
                      {!perfil && (
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 100, background: 'rgba(108,115,146,0.15)', color: '#6C7392' }}>
                          Sin perfil físico
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-dim text-xs" style={{ fontFamily: 'DM Mono, monospace' }}>
                      {sus.length} rutina{sus.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-dim text-xs">{abierto ? '▲' : '▼'}</span>
                  </div>
                </button>

                {abierto && (
                  <div>
                    {/* Perfil físico */}
                    {perfil ? (
                      <div className="px-4 py-4 border-b border-steel bg-night/30">
                        <p className="text-xs uppercase tracking-widest text-dim mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>
                          Perfil físico
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <StatChip label="Experiencia" value={EXPERIENCIA_LABELS[perfil.experiencia]} />
                          <StatChip label="Actividad"   value={ACTIVIDAD_LABELS[perfil.actividad_actual]} />
                          <StatChip label="Objetivo"    value={OBJETIVO_LABELS[perfil.objetivo]} />
                          {perfil.edad      && <StatChip label="Edad"   value={`${perfil.edad} años`} />}
                          {perfil.peso_kg   && <StatChip label="Peso"   value={`${perfil.peso_kg} kg`} />}
                          {perfil.altura_cm && <StatChip label="Altura" value={`${perfil.altura_cm} cm`} />}
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-3 border-b border-steel bg-night/30">
                        <p className="text-dim text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                          Este usuario aún no ha completado su perfil físico.
                        </p>
                      </div>
                    )}

                    {/* Rutinas */}
                    {sus.length === 0 ? (
                      <p className="text-dim text-sm px-4 py-3">Sin rutinas creadas</p>
                    ) : (
                      <div className="divide-y divide-steel">
                        {sus.map((r) => (
                          <div key={r.id} className="px-4 py-3 flex items-center justify-between">
                            <div>
                              <span className="text-sm text-white">{r.nombre}</span>
                              <span className="text-dim text-xs ml-2" style={{ fontFamily: 'DM Mono, monospace' }}>
                                {r.rutina_ejercicio?.length ?? 0} ejercicios · {r.frecuencia_semanal} días/sem
                              </span>
                            </div>
                            <NivelBadge nivel={r.nivel} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 bg-surface border border-steel rounded-lg px-3 py-2">
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6C7392' }}>
        {label}
      </span>
      <span className="text-white text-xs font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        {value}
      </span>
    </div>
  );
}
