// Ginkgo Rebuild — Predictive Rainfall Scenario Card Component (Light Theme)
import { useState, type FC } from 'react';
import type { RainfallScenario } from '../../types';

interface RainfallScenarioCardProps {
  scenarios?: RainfallScenario[];
}

const DEFAULT_SCENARIOS: RainfallScenario[] = [
  { scenario: 'Normal (50 mm/hr)', rainfall_mmhr: 50, flood_risk_score: 22, affected_area_pct: 12, status: 'Suitable' },
  { scenario: 'Heavy Rain (120 mm/hr)', rainfall_mmhr: 120, flood_risk_score: 58, affected_area_pct: 48, status: 'Conditional' },
  { scenario: 'Extreme Storm (200 mm/hr)', rainfall_mmhr: 200, flood_risk_score: 86, affected_area_pct: 82, status: 'High Constraint' },
];

export const RainfallScenarioCard: FC<RainfallScenarioCardProps> = ({ scenarios = DEFAULT_SCENARIOS }) => {
  const [selectedIdx, setSelectedIdx] = useState(1);

  const list = scenarios.length ? scenarios : DEFAULT_SCENARIOS;
  const active = list[selectedIdx] || list[0];

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('suitable')) return 'badge badge-low';
    if (s.includes('conditional')) return 'badge badge-mod';
    return 'badge badge-high';
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('suitable')) return '#15803D';
    if (s.includes('conditional')) return '#D97706';
    return '#DC2626';
  };

  return (
    <div style={{
      background: 'var(--bg-subtle)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)', padding: '12px 14px',
    }}>
      {/* Header Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 10, background: '#E5E7EB', padding: 2, borderRadius: 6 }}>
        {list.map((sc, i) => {
          const isSel = selectedIdx === i;
          return (
            <button
              key={sc.scenario}
              onClick={() => setSelectedIdx(i)}
              style={{
                flex: 1, padding: '4px 6px', border: 'none', borderRadius: 4,
                background: isSel ? '#FFFFFF' : 'transparent',
                color: isSel ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 11, fontWeight: isSel ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.15s ease',
                boxShadow: isSel ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {i === 0 ? 'Normal' : i === 1 ? 'Heavy' : 'Extreme'}
            </button>
          );
        })}
      </div>

      {/* Selected Scenario Details */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
            {active.scenario}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Intensity: {active.rainfall_mmhr} mm/hr (Design Storm)
          </div>
        </div>
        <span className={getStatusBadge(active.status)}>
          {active.status}
        </span>
      </div>

      {/* Metric Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Predicted Flood Risk Score</span>
            <span className="font-mono tabular" style={{ fontWeight: 700, color: getStatusColor(active.status) }}>
              {active.flood_risk_score}/100
            </span>
          </div>
          <div style={{ height: 5, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${active.flood_risk_score}%`, height: '100%', background: getStatusColor(active.status) }} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Inundation Area Footprint</span>
            <span className="font-mono tabular" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {active.affected_area_pct}%
            </span>
          </div>
          <div style={{ height: 5, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${active.affected_area_pct}%`, height: '100%', background: '#0284C7' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
