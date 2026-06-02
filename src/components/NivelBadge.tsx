import type { Nivel } from '../models/types';

const styles: Record<Nivel, { bg: string; color: string; border: string }> = {
  Principiante: { bg: 'rgba(34,197,94,0.12)',  color: '#22C55E', border: 'rgba(34,197,94,0.3)'  },
  Intermedio:   { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
  Avanzado:     { bg: 'rgba(255,77,77,0.12)',   color: '#FF4D4D', border: 'rgba(255,77,77,0.3)'  },
};

export default function NivelBadge({ nivel }: { nivel: Nivel | null }) {
  if (!nivel) return null;
  const s = styles[nivel];
  return (
    <span style={{
      fontFamily: 'DM Mono, monospace',
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      padding: '3px 10px',
      borderRadius: 100,
      background: s.bg,
      color: s.color,
      border: `0.5px solid ${s.border}`,
    }}>
      {nivel}
    </span>
  );
}
