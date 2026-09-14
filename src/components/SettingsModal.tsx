import type { FC } from 'react';
import { STANDALONE_MODE } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div
        style={{
          background: '#FFFFFF', borderRadius: 8, border: '1px solid var(--border)',
          width: '100%', maxWidth: 520, padding: 24, boxShadow: 'var(--shadow-lg)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
            System & Geospatial Settings
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 12 }}>
          {/* Operating Mode */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Deployment Mode</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Cloudflare Pages static runtime</div>
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)', fontWeight: 600,
              color: STANDALONE_MODE ? '#15803D' : '#2563EB',
              background: STANDALONE_MODE ? '#F0FDF4' : '#EFF6FF',
              padding: '3px 8px', borderRadius: 4, fontSize: 11,
              border: `1px solid ${STANDALONE_MODE ? '#BBF7D0' : '#BFDBFE'}`,
            }}>
              {STANDALONE_MODE ? '⚡ Standalone (Zero Maintenance)' : '🔌 Live API Mode'}
            </span>
          </div>

          {/* Item 1 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>AI Planning Reasoning Model</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Multi-agent Town Planner persona</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--brand-green)' }}>
              Gemini 3.7 Flash (OpenRouter)
            </span>
          </div>

          {/* Item 2 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Primary Satellite Sensor</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Multi-spectral remote sensing</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Sentinel-2 L2A (10m GSD)
            </span>
          </div>

          {/* Item 3 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Coordinate Reference System (CRS)</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Malaysian Grid / Global standard</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
              EPSG:4326 (WGS 84)
            </span>
          </div>

          {/* Item 4 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Stormwater Guidelines Standard</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>On-Site Detention (OSD) formula</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
              MSMA 2nd Edition (DID Malaysia)
            </span>
          </div>

          {/* Item 5 */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>River Buffer Zone Regulation</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mandatory minimum setback</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
              RW CEKAL (100m Setback)
            </span>
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
