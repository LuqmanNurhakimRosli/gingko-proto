// Ginkgo Rebuild — Editorial Planning Assessment Report View
// Generates official Planning Assessment Document with live PDF, GeoJSON, and JSON exports.

import { useState, type FC } from 'react';
import { ZoneBadge } from '../components/ZoneBadge';
import { LandCoverBarChart } from '../components/charts/LandCoverBarChart';
import { FloodRiskDonutChart } from '../components/charts/FloodRiskDonutChart';
import { RainfallScenarioCard } from '../components/charts/RainfallScenarioCard';
import { OSDCalculatorCard } from '../components/charts/OSDCalculatorCard';
import { getPreviewUrl, generatePdfReport } from '../services/api';
import { downloadPdfReport, downloadGeoJsonReport, downloadJsonReport } from '../services/reportExporter';
import type { AnalysisResult } from '../types';

interface ReportPageProps {
  result: AnalysisResult;
  onBackToWorkspace: () => void;
}

export const ReportPage: FC<ReportPageProps> = ({ result, onBackToWorkspace }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportReady, setExportReady] = useState(false);
  const [activeNav, setActiveNav] = useState('sec-1');

  const overview = result.overview;
  const lc = overview.land_cover;
  const osd = overview.osd;
  const previewUrl = result.preview_url ? getPreviewUrl(result.preview_url) : null;

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      await generatePdfReport(result.job_id);
      setExportReady(true);
    } catch (e) {
      console.error('Export generation error:', e);
      setExportReady(true); // Fallback to let user download GeoJSON/JSON
    } finally {
      setIsExporting(false);
    }
  };

  const reportSections = [
    { id: 'sec-1', label: '1. Executive Summary' },
    { id: 'sec-2', label: '2. Study Area Observation' },
    { id: 'sec-3', label: '3. Data Sources & Provenance' },
    { id: 'sec-4', label: '4. Flood Risk Analysis' },
    { id: 'sec-5', label: '5. Key Findings & Linkage' },
    { id: 'sec-6', label: '6. Impervious Surface & OSD' },
    { id: 'sec-7', label: '7. Terrain & River Buffer' },
    { id: 'sec-8', label: '8. Rainfall Scenarios' },
    { id: 'sec-9', label: '9. Site Constraints' },
    { id: 'sec-10', label: '10. Allocated Planning Zones' },
  ];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 48px)', background: 'var(--bg-subtle)' }}>
      {/* ── Left: Document Outline Navigation (220px) ──────────────── */}
      <aside style={{
        width: 220, borderRight: '1px solid var(--border)', background: '#FFFFFF',
        display: 'flex', flexDirection: 'column', padding: '16px 12px', flexShrink: 0,
      }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onBackToWorkspace}
          style={{ marginBottom: 16, justifyContent: 'flex-start' }}
        >
          ◀ Back to Workspace
        </button>

        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, paddingLeft: 6 }}>
          Report Outline
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {reportSections.map(sec => (
            <button
              key={sec.id}
              onClick={() => {
                setActiveNav(sec.id);
                document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                textAlign: 'left', padding: '6px 8px', border: 'none', borderRadius: 4,
                background: activeNav === sec.id ? 'var(--brand-green-light)' : 'transparent',
                color: activeNav === sec.id ? 'var(--brand-green-dark)' : 'var(--text-secondary)',
                fontSize: 11, fontWeight: activeNav === sec.id ? 700 : 500, cursor: 'pointer',
              }}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Center: Editorial Document Preview (White Paper) ────────── */}
      <main className="scroll-y" style={{ flex: 1, padding: '24px 32px' }}>
        <div style={{
          maxWidth: 820, margin: '0 auto', background: '#FFFFFF', border: '1px solid var(--border)',
          borderRadius: 8, padding: '40px 48px', boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Header */}
          <div style={{ borderBottom: '2px solid #111111', paddingBottom: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', color: 'var(--brand-green)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Ginkgo Spatial Planning Intelligence • Screening Assessment
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#111111', marginBottom: 4 }}>
                  Preliminary Flood Risk & Development Suitability Assessment
                </h1>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  Pahang River Catchment • Job: {result.job_id.slice(0, 8)} • Date: {new Date(result.completed_at).toLocaleDateString()}
                </div>
              </div>
              <span className={`badge ${overview.overall_suitability === 'SUITABLE' ? 'badge-low' : 'badge-mod'}`} style={{ fontSize: 12, padding: '4px 10px' }}>
                {overview.overall_suitability.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <section id="sec-1" style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111111', borderBottom: '1px solid var(--border)', paddingBottom: 4, marginBottom: 10 }}>
              1. Executive Summary
            </h2>
            <p style={{ fontSize: 12, color: '#333333', lineHeight: 1.7, marginBottom: 12 }}>
              {overview.summary}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, background: 'var(--bg-subtle)', padding: 12, borderRadius: 6 }}>
              <div>
                <div className="indicator-label">Overall Suitability</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--brand-green)', marginTop: 2 }}>{overview.overall_suitability}</div>
              </div>
              <div>
                <div className="indicator-label">Flood Risk Index</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#111111', marginTop: 2 }}>{overview.overall_flood_risk.toFixed(1)} / 100</div>
              </div>
              <div>
                <div className="indicator-label">Impervious Cover</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#111111', marginTop: 2 }}>{lc.urban.toFixed(1)}%</div>
              </div>
              <div>
                <div className="indicator-label">Required OSD Volume</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--brand-green)', marginTop: 2 }}>{osd.osd_volume_m3.toLocaleString()} m³</div>
              </div>
            </div>
          </section>

          {/* Section 2: Study Area Map Image */}
          <section id="sec-2" style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111111', borderBottom: '1px solid var(--border)', paddingBottom: 4, marginBottom: 10 }}>
              2. Study Area & Satellite Observation
            </h2>
            {previewUrl && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', marginBottom: 8, maxHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6' }}>
                <img src={previewUrl} alt="Study Area" style={{ maxHeight: 300, width: '100%', objectFit: 'contain' }} />
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              Figure 1: Sentinel-2 L2A 10m Ground Sample Distance (GSD) multi-spectral observation over the proposed planning sector.
            </div>
          </section>

          {/* Section 3: Data Sources & Provenance Matrix */}
          <section id="sec-3" style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111111', borderBottom: '1px solid var(--border)', paddingBottom: 4, marginBottom: 10 }}>
              3. Data Sources & Provenance Matrix
            </h2>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-green)', textTransform: 'uppercase', marginBottom: 4 }}>
                A. Track B Official Data
              </div>
              <div style={{ background: '#F0F9F3', border: '1px solid #DCF2E4', borderRadius: 6, padding: '10px 12px', fontSize: 11, color: '#166534', lineHeight: 1.6 }}>
                <strong>Dataset:</strong> Official Remote Sensing Multi-Spectral Imagery (Sentinel-2 L2A, 10m GSD)<br />
                <strong>Used as:</strong> Primary spatial analysis input • Study area delineation • Spectral feature extraction (NDVI, NDWI, NDBI) • AI Model Input<br />
                <strong>Study Location:</strong> Pahang River Catchment / Selayang Basin • <strong>Temporal Coverage:</strong> 2024–2026 Observations
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: 4 }}>
                B. Additional Geospatial & Meteorological Data
              </div>
              <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>Data Layer</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>Source / Provider</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>Analytical Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>DEM / Elevation</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>Copernicus DEM (30m) / SRTM / JUPEM</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>Terrain relief & slope gradient (&gt;12%) analysis</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>Rainfall Intensity</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>METMalaysia API (Jabatan Meteorologi) / JPS Infobanjir</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>Predictive storm scenario simulation (50, 120, 200 mm/hr)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>River / Waterbody</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>JPS National River Network &amp; OpenStreetMap</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>Hydrological flow &amp; 100m RW CEKAL river buffer setback</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>AI Flood Risk Model</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>Ginkgo Team's Trained Ensemble (Random Forest + HGB)</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>Inundation probability &amp; vulnerability scoring (0–100)</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>
                Satellite/Spatial Data + Terrain + Hydrological Features ➔ AI Flood Intelligence
              </div>
            </div>
          </section>

          {/* Section 4: Flood Risk Analysis & Donut Chart */}
          <section id="sec-4" style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111111', borderBottom: '1px solid var(--border)', paddingBottom: 4, marginBottom: 10 }}>
              4. Flood Risk Analysis
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: 12, color: '#333333', lineHeight: 1.6 }}>
                Multi-criteria hydrological analysis indicates significant spatial variance across the site. The low-lying eastern basin is exposed to potential river overtopping during extreme monsoon storms, while western elevations remain resilient.
              </p>
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 6, padding: 10 }}>
                <FloodRiskDonutChart overallRisk={overview.overall_flood_risk} />
              </div>
            </div>
          </section>

          {/* Section 6: Impervious Surface & OSD Calculation */}
          <section id="sec-6" style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111111', borderBottom: '1px solid var(--border)', paddingBottom: 4, marginBottom: 10 }}>
              6. Impervious Surface Analysis & MSMA OSD Storage
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 6, padding: 12 }}>
                <div className="section-title">Surface Composition</div>
                <LandCoverBarChart data={lc} />
              </div>
              <OSDCalculatorCard osd={osd} />
            </div>
          </section>

          {/* Section 8: Rainfall Scenarios */}
          <section id="sec-8" style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111111', borderBottom: '1px solid var(--border)', paddingBottom: 4, marginBottom: 10 }}>
              8. Predictive Rainfall Scenario Progression
            </h2>
            <RainfallScenarioCard scenarios={overview.rainfall_scenarios} />
          </section>

          {/* Section 10: Allocated Planning Zones */}
          <section id="sec-10" style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111111', borderBottom: '1px solid var(--border)', paddingBottom: 4, marginBottom: 10 }}>
              10. Allocated Planning Zones (Akta 172 Land Use Designation)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.areas.map((area, idx) => (
                <div key={area.area_id} style={{
                  background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                  borderLeft: `3px solid ${area.zone_color || 'var(--brand-green)'}`, borderRadius: 6, padding: '10px 12px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <strong style={{ fontSize: 12 }}>Sector {idx + 1} ({area.area_id.toUpperCase()})</strong>
                      <ZoneBadge code={area.zone_code} showLabel size="sm" />
                    </div>
                    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                      Flood: <strong>{area.flood_risk_score}/100</strong> • Suitability: <strong style={{ color: 'var(--brand-green)' }}>{area.suitability_score}/100</strong>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 4 }}>
                    {area.explanation}
                  </p>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    <strong>Statutory Conditions:</strong> {area.planning_conditions}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Statutory Disclaimer */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <strong>STATUTORY DISCLAIMER:</strong> This report is generated by the Ginkgo Spatial Intelligence Platform for preliminary planning decision support under Act 172 and MSMA 2nd Edition. On-ground verification by licensed surveyors and certified engineers remains mandatory.
          </div>
        </div>
      </main>

      {/* ── Right: Report Settings & Export Strip (260px) ──────────── */}
      <aside style={{
        width: 260, borderLeft: '1px solid var(--border)', background: '#FFFFFF',
        display: 'flex', flexDirection: 'column', padding: 20, flexShrink: 0, gap: 16,
      }}>
        <div>
          <span className="section-title">Export Options</span>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
            Generate official decision artifacts for local authority submissions.
          </p>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={handleExportAll}
          disabled={isExporting}
        >
          {isExporting ? 'Generating Artifacts…' : '📋 Generate All Exports'}
        </button>

        {exportReady && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => downloadPdfReport(result)}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              📄 Download PDF Screening Report
            </button>
            <button
              onClick={() => downloadGeoJsonReport(result)}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              🗺️ Download QGIS GeoJSON Layer
            </button>
            <button
              onClick={() => downloadJsonReport(result)}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              📊 Download Analysis JSON Data
            </button>
          </div>
        )}

        <div className="divider" />

        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
            Report Metadata
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div><strong>Framework:</strong> MSMA 2nd Ed. / Act 172</div>
            <div><strong>Spatial Resolution:</strong> 10m Sentinel-2 GSD</div>
            <div><strong>Coordinate System:</strong> EPSG:4326 (WGS 84)</div>
            <div><strong>Rainfall Source:</strong> METMalaysia API</div>
            <div><strong>Elevation Source:</strong> Copernicus DEM (30m)</div>
            <div><strong>AI Model:</strong> Gemini 2.5 Flash + RF Ensemble</div>
          </div>
        </div>
      </aside>
    </div>
  );
};
