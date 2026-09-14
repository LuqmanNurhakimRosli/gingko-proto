// Ginkgo Rebuild — Main Spatial Analysis Workspace (Felt × CARTO × ArcGIS × Palantir)
// Layout: Left Collapsible Layer Panel + Center Map (65-75%) + Right Planning Intelligence Panel

import { useState, useEffect, type FC } from 'react';
import { CanvasOverlay } from '../components/CanvasOverlay';
import { ZoneBadge } from '../components/ZoneBadge';
import { LandCoverBarChart } from '../components/charts/LandCoverBarChart';
import { FloodRiskDonutChart } from '../components/charts/FloodRiskDonutChart';
import { RainfallScenarioCard } from '../components/charts/RainfallScenarioCard';
import { OSDCalculatorCard } from '../components/charts/OSDCalculatorCard';
import { getPreviewUrl } from '../services/api';
import type { AnalysisResult, KeyFinding } from '../types';
import type { NavSection } from '../components/layout/LeftNav';

interface DashboardPageProps {
  result: AnalysisResult;
  activeSection?: NavSection;
  onGenerateReport: () => void;
}

export const DashboardPage: FC<DashboardPageProps> = ({
  result,
  activeSection = 'spatial',
  onGenerateReport,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(result.areas[0]?.area_id ?? null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [layerPanelOpen, setLayerPanelOpen] = useState(true);
  const [activeTool, setActiveTool] = useState<'select' | 'measure' | 'compare'>('select');
  const [activeTab, setActiveTab] = useState<'brief' | 'flood' | 'planning'>(
    activeSection === 'flood' ? 'flood' : activeSection === 'planning' ? 'planning' : 'brief'
  );

  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({
    floodRisk: true,
    elevation: true,
    slope: false,
    flow: activeSection === 'flood',
    impervious: true,
    riverBuffer: true,
  });

  // Sync tab with left navigation clicks
  useEffect(() => {
    if (activeSection === 'flood') {
      setActiveTab('flood');
      setVisibleLayers(prev => ({ ...prev, floodRisk: true, flow: true }));
      const floodArea = result.areas.find(a => a.category === 'FLOOD_EXPOSED' || (a.flood_risk_score ?? 0) > 50);
      if (floodArea) handleShowOnMap(floodArea.area_id);
    } else if (activeSection === 'planning') {
      setActiveTab('planning');
    } else if (activeSection === 'spatial') {
      setActiveTab('brief');
    }
  }, [activeSection, result.areas]);

  const selectedArea = result.areas.find(a => a.area_id === selectedId) ?? result.areas[0];
  const previewUrl = result.preview_url ? getPreviewUrl(result.preview_url) : null;
  const overview = result.overview;

  const toggleLayer = (key: string) => {
    setVisibleLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleShowOnMap = (areaId?: string | null) => {
    if (!areaId) return;
    setSelectedId(areaId);
    setHighlightedId(areaId);
    setTimeout(() => setHighlightedId(null), 3500);
  };

  const getSuitabilityBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('suitable')) return 'badge badge-low';
    if (s.includes('conditional')) return 'badge badge-mod';
    return 'badge badge-high';
  };

  return (
    <div className="workspace-layout">
      {/* ── Left: Collapsible Layers & Tools Panel (240px) ────────── */}
      {layerPanelOpen && (
        <aside className="layer-panel animate-fade-in">
          <div className="layer-panel-header">
            <span className="section-title" style={{ marginBottom: 0 }}>Spatial Layers</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setLayerPanelOpen(false)}
              title="Collapse Layers"
            >
              ◀
            </button>
          </div>

          <div className="layer-panel-content">
            {/* Layers Toggle List */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                Active Overlays
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { key: 'floodRisk', label: 'AI Flood Risk Exposure', color: '#DC2626' },
                  { key: 'elevation', label: 'DEM Elevation Profile', color: '#D97706' },
                  { key: 'slope', label: 'Slope Gradient (>12%)', color: '#EA580C' },
                  { key: 'flow', label: 'Flow Accumulation Network', color: '#2563EB' },
                  { key: 'impervious', label: 'Impervious Built-up', color: '#7C3AED' },
                  { key: 'riverBuffer', label: 'RW CEKAL 100m River Buffer', color: '#08A045' },
                ].map(l => (
                  <label key={l.key} className="layer-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={!!visibleLayers[l.key]}
                        onChange={() => toggleLayer(l.key)}
                        style={{ accentColor: 'var(--brand-green)', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: visibleLayers[l.key] ? 600 : 400 }}>
                        {l.label}
                      </span>
                    </div>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, opacity: visibleLayers[l.key] ? 1 : 0.3 }} />
                  </label>
                ))}
              </div>
            </div>

            <div className="divider" />

            {/* Quick Tools */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                GIS Tools
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button
                  className={`btn ${activeTool === 'select' ? 'btn-subtle' : 'btn-ghost'} btn-sm`}
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => setActiveTool('select')}
                >
                  <span>⬚</span> Select Polygon Sector
                </button>
                <button
                  className={`btn ${activeTool === 'measure' ? 'btn-subtle' : 'btn-ghost'} btn-sm`}
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => setActiveTool('measure')}
                >
                  <span>📏</span> Measure River Distance
                </button>
                <button
                  className={`btn ${activeTool === 'compare' ? 'btn-subtle' : 'btn-ghost'} btn-sm`}
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => setActiveTool('compare')}
                >
                  <span>◫</span> Compare Rainfall Scenarios
                </button>
              </div>
            </div>

            <div className="divider" />

            {/* Zoning Legend */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                Akta 172 Land Use
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {[
                  { code: 'R1-R3', label: 'Residential', color: '#22C55E' },
                  { code: 'C1-C2', label: 'Commercial', color: '#F59E0B' },
                  { code: 'GI', label: 'Green Buffer', color: '#08A045' },
                  { code: 'UT', label: 'Drainage / Utility', color: '#64748B' },
                ].map(z => (
                  <div key={z.code} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: z.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{z.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ── Center: Map Workspace (65–75% Visual Attention) ────────── */}
      <main className="map-canvas-container">
        {/* Floating Top-Left Bar */}
        <div className="map-float-top-left">
          {!layerPanelOpen && (
            <button
              className="btn btn-secondary btn-sm"
              style={{ boxShadow: 'var(--shadow-sm)' }}
              onClick={() => setLayerPanelOpen(true)}
            >
              ▶ Layers
            </button>
          )}
          <input
            type="text"
            className="map-search-input"
            placeholder="Search parcel, lat/lon, or river…"
            defaultValue="Pahang River Basin Sector 4"
          />
        </div>

        {/* Floating Left GIS Tool Strip */}
        <div className="map-toolbar-left">
          <button
            className={`map-tool-btn${activeTool === 'select' ? ' active' : ''}`}
            onClick={() => setActiveTool('select')}
            title="Select Sector"
          >
            ⬚
          </button>
          <button
            className={`map-tool-btn${activeTool === 'measure' ? ' active' : ''}`}
            onClick={() => setActiveTool('measure')}
            title="Measure Distance"
          >
            📏
          </button>
          <button
            className={`map-tool-btn${activeTool === 'compare' ? ' active' : ''}`}
            onClick={() => setActiveTool('compare')}
            title="Scenario Compare"
          >
            ◫
          </button>
        </div>

        {/* Tight Map Image & Canvas Overlay Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: 24,
        }}>
          {previewUrl ? (
            <div style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '100%',
              maxHeight: '100%',
              lineHeight: 0,
            }}>
              <img
                src={previewUrl}
                alt="Satellite Map"
                style={{
                  maxWidth: '100%',
                  maxHeight: 'calc(100vh - 120px)',
                  width: 'auto',
                  height: 'auto',
                  display: 'block',
                  borderRadius: 4,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                }}
              />
              <CanvasOverlay
                areas={result.areas}
                imageWidth={result.preview_width}
                imageHeight={result.preview_height}
                selectedAreaId={selectedId}
                highlightedAreaId={highlightedId}
                visibleLayers={visibleLayers}
                onSelectArea={(id) => setSelectedId(id)}
              />
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              Map rendering in 10m Ground Sample Distance…
            </div>
          )}
        </div>

        {/* Floating Bottom Scale & Coordinates Bar */}
        <div className="map-float-bottom">
          <div className="map-status-pill">
            3°49'22"N, 102°24'18"E • Elevation: 24m ASL • Slope: 2.8%
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <div className="map-status-pill">
              Scale 1 : 10,000 (100m)
            </div>
            <div className="map-status-pill" style={{ color: 'var(--brand-green)', fontWeight: 600 }}>
              ESA SENTINEL-2 L2A
            </div>
          </div>
        </div>
      </main>

      {/* ── Right: Planning Intelligence Panel (380px) ─────────────── */}
      <aside className="intel-panel">
        {/* Header with Navigation Tabs */}
        <div className="intel-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="section-title" style={{ marginBottom: 0 }}>
              {activeTab === 'flood' ? 'Flood Intelligence' : activeTab === 'planning' ? 'Akta 172 Assessment' : 'Planning Intelligence'}
            </span>
            <span className={getSuitabilityBadge(overview.overall_suitability)}>
              {overview.overall_suitability.replace('_', ' ')}
            </span>
          </div>

          {/* Subtabs to switch views easily */}
          <div style={{ display: 'flex', gap: 4, background: '#E5E7EB', padding: 2, borderRadius: 6, marginBottom: 8 }}>
            {[
              { key: 'brief', label: 'Spatial Brief' },
              { key: 'flood', label: 'Flood Risk' },
              { key: 'planning', label: 'Zoning & OSD' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                style={{
                  flex: 1, padding: '4px 6px', border: 'none', borderRadius: 4,
                  background: activeTab === t.key ? '#FFFFFF' : 'transparent',
                  color: activeTab === t.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: 10, fontWeight: activeTab === t.key ? 700 : 500,
                  cursor: 'pointer', transition: 'all 0.15s ease',
                  boxShadow: activeTab === t.key ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {activeTab === 'flood'
              ? 'Predictive Inundation & Storm Scenarios'
              : activeTab === 'planning'
              ? 'Statutory Zoning & MSMA Compliance'
              : 'Preliminary Site Determination'}
          </h2>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.4 }}>
            {overview.summary}
          </p>
        </div>

        {/* Scrollable Content based on activeTab */}
        <div className="intel-panel-content scroll-y">
          {/* Tab 1: Spatial Brief View */}
          {activeTab === 'brief' && (
            <>
              {/* Key Indicators */}
              <div>
                <div className="section-title">Key Planning Indicators</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 12px' }}>
                    <div className="indicator-label">Site Suitability</div>
                    <div className="indicator-number" style={{ color: 'var(--brand-green)', marginTop: 2 }}>
                      {selectedArea?.suitability_score ?? 72}<span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>/100</span>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 12px' }}>
                    <div className="indicator-label">Flood Risk Score</div>
                    <div className="indicator-number" style={{ color: selectedArea?.flood_risk_score && selectedArea.flood_risk_score > 50 ? '#DC2626' : '#D97706', marginTop: 2 }}>
                      {selectedArea?.flood_risk_score ?? overview.overall_flood_risk.toFixed(0)}<span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>/100</span>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 12px' }}>
                    <div className="indicator-label">Impervious Surface</div>
                    <div className="indicator-number" style={{ color: 'var(--text-primary)', marginTop: 2 }}>
                      {overview.land_cover.urban.toFixed(1)}%
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 12px' }}>
                    <div className="indicator-label">Nearest Waterbody</div>
                    <div className="indicator-number" style={{ color: overview.hydrology.river_buffer_zone ? '#DC2626' : 'var(--text-primary)', marginTop: 2 }}>
                      {overview.hydrology.water_proximity_m.toFixed(0)}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>m</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="divider" />

              {/* Key Spatial Findings with [Show on Map] */}
              <div>
                <div className="section-title">Key Spatial Findings & Map Linkage</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {overview.key_findings.map((f: KeyFinding) => {
                    const isCrit = f.severity === 'CRITICAL';
                    const isHigh = f.severity === 'HIGH';
                    const color = isCrit ? '#DC2626' : isHigh ? '#D97706' : '#08A045';

                    return (
                      <div key={f.id} className="finding-card" style={{ borderLeft: `3px solid ${color}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{f.title}</span>
                          </div>
                          {f.area_id && (
                            <button
                              className="btn btn-subtle btn-sm"
                              onClick={() => handleShowOnMap(f.area_id)}
                              style={{ padding: '2px 6px', fontSize: 10 }}
                            >
                              Show on Map
                            </button>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 3 }}>
                          <strong>Evidence:</strong> {f.evidence}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          <strong>Implication:</strong> {f.planning_implication}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Constraints vs Opportunities */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, padding: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>CONSTRAINTS</div>
                  {overview.constraints?.map((c, i) => (
                    <div key={i} style={{ fontSize: 10, color: '#991B1B', marginBottom: 3 }}>
                      • <strong>{c.title}:</strong> {c.reason}
                    </div>
                  ))}
                </div>
                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 6, padding: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#08A045', marginBottom: 4 }}>OPPORTUNITIES</div>
                  {overview.opportunities?.map((o, i) => (
                    <div key={i} style={{ fontSize: 10, color: '#065F46', marginBottom: 3 }}>
                      • <strong>{o.title}:</strong> {o.reason}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tab 2: Flood Intelligence View */}
          {activeTab === 'flood' && (
            <>
              <div>
                <div className="section-title">Rainfall Scenario Progression</div>
                <RainfallScenarioCard scenarios={overview.rainfall_scenarios} />
              </div>

              <div>
                <div className="section-title">Flood Hazard Contribution Factors</div>
                <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px' }}>
                  <FloodRiskDonutChart overallRisk={overview.overall_flood_risk} />
                </div>
              </div>

              <div>
                <div className="section-title">Hydrological & River Proximity</div>
                <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px', fontSize: 11 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Distance to Waterbody:</span>
                    <strong>{overview.hydrology.water_proximity_m.toFixed(0)} meters</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>RW CEKAL 100m Setback:</span>
                    <strong style={{ color: overview.hydrology.river_buffer_zone ? '#DC2626' : '#08A045' }}>
                      {overview.hydrology.river_buffer_zone ? 'REQUIRES MITIGATION' : 'COMPLIANT'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Terrain Slope Category:</span>
                    <strong>{overview.terrain.slope_category}</strong>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Tab 3: Planning Assessment & Zoning View */}
          {activeTab === 'planning' && (
            <>
              <div>
                <div className="section-title">MSMA 2nd Edition Stormwater OSD</div>
                <OSDCalculatorCard osd={overview.osd} />
              </div>

              <div>
                <div className="section-title">5-Class Land Cover Breakdown</div>
                <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px' }}>
                  <LandCoverBarChart data={overview.land_cover} />
                </div>
              </div>

              <div>
                <div className="section-title">Allocated Planning Sectors (Akta 172)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.areas.map(area => (
                    <div
                      key={area.area_id}
                      onClick={() => handleShowOnMap(area.area_id)}
                      style={{
                        background: area.area_id === selectedId ? 'var(--brand-green-light)' : 'var(--bg-subtle)',
                        border: `1px solid ${area.area_id === selectedId ? 'var(--brand-green)' : 'var(--border)'}`,
                        borderRadius: 6, padding: '10px 12px', cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <strong style={{ fontSize: 11 }}>{area.area_id.toUpperCase()}</strong>
                        <ZoneBadge code={area.zone_code} showLabel size="sm" />
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4 }}>
                        {area.explanation}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        <strong>Conditions:</strong> {area.planning_conditions}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="divider" />

          {/* Bottom Action CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="section-title">Recommended Planning Action</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, background: '#F0F9F3', border: '1px solid #DCF2E4', borderRadius: 6, padding: '10px 12px' }}>
              <strong>Immediate:</strong> Commission Drainage Impact Assessment (DIA) under MSMA 2nd Edition and delineate 100m RW CEKAL river setback before Development Order submission.
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 2 }}
              onClick={onGenerateReport}
            >
              📄 Generate Formal Planning Report
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
