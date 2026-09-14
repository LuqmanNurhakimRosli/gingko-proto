// Ginkgo Rebuild — Zone Badge Component (Light Theme)
import type { FC } from 'react';
import type { ZoneCode } from '../types';

const ZONE_META: Record<ZoneCode, { label: string; color: string; bg: string; border: string }> = {
  R1: { label: 'Low-Density Residential',    color: '#15803D', bg: '#DCFCE7', border: '#86EFAC' },
  R2: { label: 'Medium-Density Residential', color: '#16A34A', bg: '#DCFCE7', border: '#4ADE80' },
  R3: { label: 'High-Density Residential',   color: '#15803D', bg: '#BBF7D0', border: '#22C55E' },
  C1: { label: 'Neighbourhood Commercial',   color: '#B45309', bg: '#FEF3C7', border: '#FCD34D' },
  C2: { label: 'District Commercial',        color: '#D97706', bg: '#FEF3C7', border: '#F59E0B' },
  A:  { label: 'Agricultural',               color: '#4D7C0F', bg: '#ECFCCB', border: '#A3E635' },
  GI: { label: 'Green Infrastructure',       color: '#08A045', bg: '#E8F6ED', border: '#86EFAC' },
  UT: { label: 'Utility & Infrastructure',   color: '#475569', bg: '#F1F5F9', border: '#CBD5E1' },
};

interface ZoneBadgeProps {
  code: ZoneCode | string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const ZoneBadge: FC<ZoneBadgeProps> = ({ code, showLabel = false, size = 'md' }) => {
  const meta = ZONE_META[code as ZoneCode] ?? {
    label: code,
    color: '#475569',
    bg: '#F1F5F9',
    border: '#CBD5E1',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        color: meta.color,
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        borderRadius: 4,
        fontSize: size === 'sm' ? '10px' : '11px',
        padding: size === 'sm' ? '2px 6px' : '3px 8px',
        fontWeight: 600,
        lineHeight: 1,
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: meta.color, display: 'inline-block', flexShrink: 0,
      }} />
      <strong>{code}</strong>
      {showLabel && <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}> — {meta.label}</span>}
    </span>
  );
};
