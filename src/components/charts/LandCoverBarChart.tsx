// Ginkgo Rebuild — Land Cover Composition Chart Component (Light Theme)
import type { FC } from 'react';
import type { LandCoverComposition } from '../../types';

interface LandCoverBarChartProps {
  data?: LandCoverComposition;
}

const CLASSES = [
  { key: 'urban', label: 'Built-up / Impervious', color: '#DC2626', icon: '🏗️', desc: 'Buildings, paved surfaces, roads' },
  { key: 'vegetation', label: 'Vegetation Canopy', color: '#08A045', icon: '🌲', desc: 'Forest cover, green buffer' },
  { key: 'water', label: 'Water Bodies', color: '#0284C7', icon: '💧', desc: 'River, wetlands, retention' },
  { key: 'soil', label: 'Bare Soil / Rock', color: '#D97706', icon: '🪨', desc: 'Exposed ground' },
  { key: 'agriculture', label: 'Agricultural', color: '#65A30D', icon: '🌾', desc: 'Cultivated plots, smallholdings' },
] as const;

export const LandCoverBarChart: FC<LandCoverBarChartProps> = ({ data }) => {
  const lc: LandCoverComposition = data ?? {
    urban: 30.0,
    vegetation: 40.0,
    water: 10.0,
    soil: 10.0,
    agriculture: 10.0,
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Top stacked overview bar */}
      <div style={{
        display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden',
        background: '#E5E7EB', marginBottom: 12,
      }}>
        {CLASSES.map(c => {
          const val = lc[c.key as keyof LandCoverComposition] || 0;
          if (val <= 0) return null;
          return (
            <div
              key={c.key}
              style={{
                width: `${val}%`,
                background: c.color,
                transition: 'width 0.6s ease',
              }}
              title={`${c.label}: ${val.toFixed(1)}%`}
            />
          );
        })}
      </div>

      {/* Individual class breakdowns */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {CLASSES.map(c => {
          const val = lc[c.key as keyof LandCoverComposition] || 0;
          return (
            <div key={c.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12 }}>{c.icon}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{c.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 50, height: 4, background: '#E5E7EB',
                  borderRadius: 2, overflow: 'hidden'
                }}>
                  <div style={{ width: `${Math.min(100, val)}%`, height: '100%', background: c.color }} />
                </div>
                <span className="tabular font-mono" style={{ color: 'var(--text-primary)', fontWeight: 600, width: 38, textAlign: 'right' }}>
                  {val.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
