// Ginkgo Rebuild — Top Navigation Bar (Felt × CARTO style)
import type { FC } from 'react';
import type { AppState } from '../../types';

interface TopNavProps {
  currentSection: string;
  appState: AppState;
  siteName?: string;
  onNewAnalysis: () => void;
  onNavigateSection: (section: string) => void;
}

export const TopNav: FC<TopNavProps> = ({
  currentSection,
  appState,
  siteName = 'Pahang River Basin (Track B)',
  onNewAnalysis,
  onNavigateSection,
}) => {
  return (
    <header className="top-nav">
      {/* Brand & Breadcrumbs */}
      <div className="top-nav-left">
        <div className="brand-logo" onClick={() => onNavigateSection('overview')}>
          <div className="brand-icon">G</div>
          <span>GINKGO</span>
        </div>

        <div className="nav-divider" />

        <div className="breadcrumb-tag">
          <span style={{ color: 'var(--brand-green)', fontSize: 10 }}>●</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{siteName}</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ textTransform: 'capitalize' }}>
            {currentSection === 'spatial' ? 'Spatial Analysis' : currentSection}
          </span>
        </div>
      </div>

      {/* Center status badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
          background: 'var(--bg-subtle)', padding: '3px 8px', borderRadius: 4,
          border: '1px solid var(--border-subtle)',
        }}>
          🛰️ SENTINEL-2 L2A • 10m GSD • EPSG:4326
        </span>
      </div>

      {/* Right actions */}
      <div className="top-nav-right">
        {appState === 'dashboard' && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigateSection('reports')}
          >
            📄 Report View
          </button>
        )}

        <button
          className="btn btn-primary btn-sm"
          onClick={onNewAnalysis}
        >
          + New Analysis
        </button>
      </div>
    </header>
  );
};
