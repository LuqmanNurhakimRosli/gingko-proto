// Ginkgo Rebuild — Overview / Home Page (Light Theme First)
// Displays Key Metrics + Official Sample Tiles (Pahang River Basin Track B) + Quick Upload

import { useState, type FC } from 'react';
import { uploadImage, createAnalysisJob, loadSampleTile } from '../services/api';
import type { NavSection } from '../components/layout/LeftNav';

interface OverviewPageProps {
  onStartAnalysis: (params: { imageId: string; jobId: string }) => void;
  onNavigateSection: (section: NavSection) => void;
}

const SAMPLE_TILES = [
  {
    id: 'tile_1_northwest_urban',
    title: 'Northwest Urban Sector',
    location: 'Pahang River Basin — Urban Center',
    resolution: '10m Sentinel-2 L2A',
    dimensions: '512 × 512 px',
    coverage: '26.2 km²',
    characteristics: 'High built-up density, commercial hub, low flood exposure',
    suitabilityScore: 82,
    floodRiskScore: 18,
    category: 'SUITABLE',
  },
  {
    id: 'tile_2_northeast_river',
    title: 'Northeast River & Riparian Zone',
    location: 'Pahang River Catchment — Active Floodplain',
    resolution: '10m Sentinel-2 L2A',
    dimensions: '512 × 512 px',
    coverage: '26.2 km²',
    characteristics: 'Riparian corridor, severe flood hazard, 100m RW CEKAL buffer',
    suitabilityScore: 38,
    floodRiskScore: 68,
    category: 'FLOOD_EXPOSED',
  },
  {
    id: 'tile_3_southwest_residential',
    title: 'Southwest Residential Growth Area',
    location: 'Pahang River Basin — Lowland Corridor',
    resolution: '10m Sentinel-2 L2A',
    dimensions: '512 × 512 px',
    coverage: '26.2 km²',
    characteristics: 'Planned suburban extension, moderate slope, MSMA OSD required',
    suitabilityScore: 65,
    floodRiskScore: 35,
    category: 'CONDITIONAL',
  },
  {
    id: 'tile_4_southeast_agriculture',
    title: 'Southeast Agricultural Lowlands',
    location: 'Pahang River Basin — Flood Retention Sector',
    resolution: '10m Sentinel-2 L2A',
    dimensions: '512 × 512 px',
    coverage: '26.2 km²',
    characteristics: 'Seasonal inundation, oil palm/cultivation, retention wetland candidate',
    suitabilityScore: 45,
    floodRiskScore: 58,
    category: 'FLOOD_EXPOSED',
  },
];

export const OverviewPage: FC<OverviewPageProps> = ({ onStartAnalysis }) => {
  const [loadingTileId, setLoadingTileId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLaunchSample = async (tileId: string) => {
    setLoadingTileId(tileId);
    setError(null);
    try {
      const uploadRes = await loadSampleTile(tileId);
      const jobRes = await createAnalysisJob(uploadRes.image_id);
      onStartAnalysis({ imageId: uploadRes.image_id, jobId: jobRes.job_id });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to launch sample tile.');
      setLoadingTileId(null);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const uploadRes = await uploadImage(file);
      const jobRes = await createAnalysisJob(uploadRes.image_id);
      onStartAnalysis({ imageId: uploadRes.image_id, jobId: jobRes.job_id });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed. Please check connection.');
      setUploading(false);
    }
  };

  return (
    <div className="scroll-y" style={{ flex: 1, padding: '32px 36px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* ── Executive Header ────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--brand-green)', textTransform: 'uppercase', marginBottom: 4 }}>
            Geospatial Planning Workspace
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 4 }}>
            Good morning, Planner.
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Monitor, analyse, and understand flood-related development risks across statutory planning sites.
          </p>
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={() => document.getElementById('custom-upload-input')?.click()}
        >
          <span>🛰️</span> New Custom Analysis
        </button>
        <input
          id="custom-upload-input"
          type="file"
          accept=".tif,.tiff,.geotiff,.png,.jpg,.jpeg"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        />
      </div>

      {/* ── Section A: Key Intelligence Summary ─────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px', boxShadow: 'var(--shadow-xs)' }}>
          <div className="indicator-label" style={{ marginBottom: 6 }}>Active Analyses</div>
          <div className="indicator-number" style={{ color: 'var(--text-primary)' }}>24</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Pahang & Selangor Basins</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px', boxShadow: 'var(--shadow-xs)' }}>
          <div className="indicator-label" style={{ marginBottom: 6 }}>High-Risk Sites</div>
          <div className="indicator-number" style={{ color: '#DC2626' }}>7</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Immediate OSD & Setback required</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px', boxShadow: 'var(--shadow-xs)' }}>
          <div className="indicator-label" style={{ marginBottom: 6 }}>Approval Pipeline</div>
          <div className="indicator-number" style={{ color: 'var(--brand-green)' }}>12</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Development Orders (DO) in review</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px', boxShadow: 'var(--shadow-xs)' }}>
          <div className="indicator-label" style={{ marginBottom: 6 }}>Avg Processing Time</div>
          <div className="indicator-number" style={{ color: 'var(--text-primary)' }}>4.2<span style={{ fontSize: 14, fontWeight: 500 }}>s</span></div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Sentinel-2 9-Stage AI Pipeline</div>
        </div>
      </div>

      {/* ── Section B: Primary Study Area Dossier ────────────────────── */}
      <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '24px', marginBottom: 28, boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-green)', letterSpacing: '0.06em', marginBottom: 2 }}>
              Active Primary Focus Study Area
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              Pahang River Basin Catchment (Track B Focus Site)
            </h2>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              ESA Sentinel-2 L2A • Coordinate Reference: EPSG:4326 (WGS 84) • Ground Sample Distance: 10m
            </div>
          </div>
          <span className="badge badge-mod" style={{ fontSize: 11 }}>
            High Flood Vulnerability Zone
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, background: 'var(--bg-subtle)', borderRadius: 6, padding: '14px 16px', marginBottom: 16 }}>
          <div>
            <div className="indicator-label">River Proximity</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>65m to Mainstem</div>
            <div style={{ fontSize: 11, color: '#DC2626', marginTop: 2 }}>Within RW CEKAL 100m buffer</div>
          </div>
          <div>
            <div className="indicator-label">Prevalent Slope Category</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>2.8% (Flat Lowland)</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>High surface ponding potential</div>
          </div>
          <div>
            <div className="indicator-label">Design Storm Requirement</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand-green)', marginTop: 2 }}>100-Year ARI (MSMA)</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Estimated 4,875 m³ OSD required</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-primary"
            onClick={() => handleLaunchSample('tile_2_northeast_river')}
            disabled={loadingTileId !== null}
          >
            {loadingTileId === 'tile_2_northeast_river' ? 'Launching Analysis Pipeline…' : '▶ Run Live Spatial Analysis on Primary Site'}
          </button>
        </div>
      </div>

      {/* ── Section C: Official Track B Dataset Crops ───────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <span className="section-title" style={{ marginBottom: 2 }}>Official Plan-AI Track B Remote Sensing Tiles</span>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Select any pre-packaged Sentinel-2 multi-spectral crop to run real-time flood & planning inference.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, alignItems: 'stretch' }}>
        {/* Tiles Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Sector Name</th>
                <th>Resolution</th>
                <th>Category</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_TILES.map(tile => (
                <tr key={tile.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tile.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{tile.characteristics}</div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{tile.resolution}</span>
                  </td>
                  <td>
                    <span className={`badge ${tile.category === 'SUITABLE' ? 'badge-low' : tile.category === 'CONDITIONAL' ? 'badge-mod' : 'badge-high'}`}>
                      {tile.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleLaunchSample(tile.id)}
                      disabled={loadingTileId !== null}
                    >
                      {loadingTileId === tile.id ? 'Running…' : '▶ Run Analysis'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Custom Raster Upload Drop Area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFileUpload(f);
          }}
          onClick={() => document.getElementById('custom-upload-input')?.click()}
          style={{
            background: dragOver ? 'var(--brand-green-subtle)' : '#FAFAFA',
            border: `1.5px dashed ${dragOver ? 'var(--brand-green)' : 'var(--border)'}`,
            borderRadius: 'var(--r-md)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>🛰️</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
            Upload Custom Satellite TIFF
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', maxWidth: 180, lineHeight: 1.4 }}>
            Drop Sentinel-2, Landsat, or UAV GeoTIFF / PNG / JPG
          </div>
          {uploading && (
            <div style={{ fontSize: 11, color: 'var(--brand-green)', fontWeight: 600, marginTop: 10 }}>
              Uploading raster…
            </div>
          )}
        </div>
      </div>

      {/* ── Section D: Data Sources & Provenance Matrix Strip ──────── */}
      <div style={{
        marginTop: 24,
        background: '#FFFFFF',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🌐</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
              Plan-AI Official Data Provenance • Track B Remote Sensing
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              Sentinel-2 L2A Multi-Spectral (10m GSD) • METMalaysia Rainfall API • Copernicus DEM (30m) • JPS River Network
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="map-status-pill" style={{ fontSize: 10, background: '#F0F9F3', color: '#166534', borderColor: '#DCF2E4' }}>
            🛰️ Track B Sentinel-2
          </span>
          <span className="map-status-pill" style={{ fontSize: 10 }}>
            🌧️ METMalaysia API
          </span>
          <span className="map-status-pill" style={{ fontSize: 10 }}>
            ⛰️ Copernicus DEM
          </span>
          <span className="map-status-pill" style={{ fontSize: 10 }}>
            💧 JPS Hydrology
          </span>
          <span className="map-status-pill" style={{ fontSize: 10, color: 'var(--brand-green)' }}>
            ⚡ Gemini 2.5 Live
          </span>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 14, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, color: '#DC2626', fontSize: 11 }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
};
