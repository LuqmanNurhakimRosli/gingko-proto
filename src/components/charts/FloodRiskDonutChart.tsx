// Ginkgo Rebuild — Flood Risk Donut Chart Component (Light Theme)
import { useState, type FC } from 'react';

interface Factor {
  label: string;
  weight: number;
  color: string;
  desc: string;
}

const FACTORS: Factor[] = [
  { label: 'Surface Imperviousness', weight: 40, color: '#DC2626', desc: 'Built-up areas reducing natural infiltration' },
  { label: 'Watercourse Proximity', weight: 35, color: '#0284C7', desc: 'Distance to river or drainage channel' },
  { label: 'Low Elevation & Slope', weight: 20, color: '#D97706', desc: 'Accumulation depression terrain' },
  { label: 'Drainage Capacity', weight: 15, color: '#7C3AED', desc: 'MSMA infrastructure adequacy' },
];

export const FloodRiskDonutChart: FC<{ overallRisk?: number }> = ({ overallRisk = 45 }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const totalWeight = FACTORS.reduce((sum, f) => sum + f.weight, 0);
  const size = 100;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {/* SVG Donut */}
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth={strokeWidth}
          />
          {FACTORS.map((f, i) => {
            const pct = f.weight / totalWeight;
            const strokeDasharray = `${pct * circumference} ${circumference}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += pct * circumference;
            const isHovered = activeIdx === i;

            return (
              <circle
                key={f.label}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={f.color}
                strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
                style={{
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  opacity: activeIdx === null || activeIdx === i ? 1 : 0.35,
                }}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center text */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: 16, fontWeight: 800, lineHeight: 1,
            color: overallRisk > 60 ? '#DC2626' : overallRisk > 35 ? '#D97706' : '#15803D'
          }}>
            {overallRisk.toFixed(0)}
          </span>
          <span style={{ fontSize: 8, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', marginTop: 2 }}>
            Index
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {FACTORS.map((f, i) => {
          const isHovered = activeIdx === i;
          return (
            <div
              key={f.label}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '2px 4px', borderRadius: 4, cursor: 'pointer',
                background: isHovered ? '#F3F4F6' : 'transparent',
                fontSize: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: f.color, flexShrink: 0 }} />
                <span style={{ color: isHovered ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {f.label}
                </span>
              </div>
              <span className="font-mono tabular" style={{ color: f.color, fontWeight: 700 }}>
                {f.weight}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
