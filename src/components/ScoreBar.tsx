// Ginkgo Rebuild — Score Bar Component (Light Theme)
import type { FC } from 'react';

interface ScoreBarProps {
  label: string;
  value: number | null;
  invertColor?: boolean; // For flood risk — high = bad
}

function getColor(value: number, invert: boolean): string {
  const v = invert ? 100 - value : value;
  if (v >= 75) return '#08A045';
  if (v >= 55) return '#D97706';
  return '#DC2626';
}

export const ScoreBar: FC<ScoreBarProps> = ({ label, value, invertColor = false }) => {
  if (value === null || value === undefined) return null;
  const pct = Math.min(100, Math.max(0, value));
  const color = getColor(pct, invertColor);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="tabular font-mono" style={{ color, fontWeight: 700 }}>
          {pct.toFixed(0)}
        </span>
      </div>
      <div style={{ height: 5, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
        <div
          style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.4s ease' }}
        />
      </div>
    </div>
  );
};
