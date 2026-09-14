// Ginkgo Rebuild — MSMA 2nd Edition OSD Calculator Card (Light Theme)
import type { FC } from 'react';
import type { OSDCalculation } from '../../types';

interface OSDCalculatorCardProps {
  osd?: OSDCalculation;
}

export const OSDCalculatorCard: FC<OSDCalculatorCardProps> = ({ osd }) => {
  const calc: OSDCalculation = osd ?? {
    runoff_coefficient: 0.65,
    rainfall_intensity_mmhr: 150,
    site_area_ha: 5.0,
    osd_volume_m3: 4875,
    formula: 'Q = C × I × A × 10',
  };

  return (
    <div style={{
      background: 'var(--bg-subtle)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)', padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13 }}>📐</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>MSMA 2nd Ed. OSD Volume</span>
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
          background: 'var(--brand-green-light)', color: 'var(--brand-green)', border: '1px solid rgba(8,160,69,0.2)',
        }}>
          DID Compliance
        </span>
      </div>

      {/* Main Volume Output */}
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 6,
        padding: '8px 10px', background: '#FFFFFF', border: '1px solid var(--border)',
        borderRadius: 6, marginBottom: 8,
      }}>
        <span className="font-mono" style={{ fontSize: 22, fontWeight: 800, color: 'var(--brand-green)', lineHeight: 1 }}>
          {calc.osd_volume_m3.toLocaleString()}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>m³ storage required</span>
      </div>

      {/* Formula & Parameters Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, fontSize: 10 }}>
        <div style={{ padding: '5px 6px', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 4 }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 9 }}>Coeff (C)</div>
          <div className="font-mono tabular" style={{ fontWeight: 700, marginTop: 1, color: 'var(--text-primary)' }}>
            {calc.runoff_coefficient.toFixed(2)}
          </div>
        </div>
        <div style={{ padding: '5px 6px', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 4 }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 9 }}>Rain (I)</div>
          <div className="font-mono tabular" style={{ fontWeight: 700, marginTop: 1, color: 'var(--text-primary)' }}>
            {calc.rainfall_intensity_mmhr} mm/h
          </div>
        </div>
        <div style={{ padding: '5px 6px', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 4 }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 9 }}>Area (A)</div>
          <div className="font-mono tabular" style={{ fontWeight: 700, marginTop: 1, color: 'var(--text-primary)' }}>
            {calc.site_area_ha.toFixed(1)} ha
          </div>
        </div>
      </div>

      <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 8, textAlign: 'center' }}>
        Formula: Q = C × I × A × 10 (100-Yr ARI Design Storm)
      </div>
    </div>
  );
};
