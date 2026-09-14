// Ginkgo Rebuild — Upload Page (State 1)
// Ingest satellite imagery via drag-drop or 1-click Sentinel-2 sample tile selection.

import { useState, useEffect, useCallback, type FC } from 'react';
import { uploadImage, createAnalysisJob, fetchSampleTiles, loadSampleTile } from '../services/api';
import type { AppData, SampleTileInfo } from '../types';

const ACCEPTED = '.png,.jpg,.jpeg,.tif,.tiff,.geotiff';
const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg', '.tif', '.tiff', '.geotiff']);

function formatBytes(b: number): string {
  if (b > 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  if (b > 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${b} B`;
}

function getExt(name: string): string {
  const parts = name.toLowerCase().split('.');
  return '.' + parts[parts.length - 1];
}

interface UploadPageProps {
  onNext: (data: Partial<AppData>) => void;
}

export const UploadPage: FC<UploadPageProps> = ({ onNext }) => {
  const [file, setFile] = useState<File | null>(null);
  const [sampleTiles, setSampleTiles] = useState<SampleTileInfo[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSampleTiles()
      .then(setSampleTiles)
      .catch(() => {
        // Fallback sample tiles if backend is loading
        setSampleTiles([
          {
            id: 'tile_1_northwest_urban',
            filename: 'tile_1_northwest_urban.tif',
            name: 'Northwest Urban Corridor',
            description: 'High impervious density with residential & commercial structures. Critical OSD testing site.',
            dominant_cover: 'Built-up (54.2%)',
            size_bytes: 2077045,
          },
          {
            id: 'tile_2_northeast_river',
            filename: 'tile_2_northeast_river.tif',
            name: 'Northeast River & Riparian Zone',
            description: 'River channel intersecting low-lying terrain. Tests RW CEKAL 100m buffer compliance.',
            dominant_cover: 'Water & Riparian (38.0%)',
            size_bytes: 3102299,
          },
          {
            id: 'tile_3_center_mixed',
            filename: 'tile_3_center_mixed.tif',
            name: 'Central Mixed-Use Sector',
            description: 'Composite landscape of agricultural plots and expanding low-density settlements.',
            dominant_cover: 'Mixed Agriculture (35.4%)',
            size_bytes: 3972257,
          },
          {
            id: 'tile_4_south_vegetation',
            filename: 'tile_4_south_vegetation.tif',
            name: 'South Forest & Conservation Hill',
            description: 'Steep terrain canopy with natural water retention. Prime candidate for Act 172 green space offset.',
            dominant_cover: 'Forest Canopy (68.4%)',
            size_bytes: 4706545,
          },
        ]);
      });
  }, []);

  const handleFile = useCallback((f: File) => {
    const ext = getExt(f.name);
    if (!ALLOWED_EXT.has(ext)) {
      setError(`Unsupported type: ${ext}. Accepted: PNG, JPG, TIFF, GeoTIFF`);
      return;
    }
    setError(null);
    setFile(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleAnalyzeFile = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const uploadRes = await uploadImage(file);
      const jobRes = await createAnalysisJob(uploadRes.image_id);
      onNext({ imageId: uploadRes.image_id, jobId: jobRes.job_id });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed. Is the backend running?');
      setUploading(false);
    }
  };

  const handleSelectSample = async (sampleId: string) => {
    setLoadingSampleId(sampleId);
    setError(null);
    try {
      const uploadRes = await loadSampleTile(sampleId);
      const jobRes = await createAnalysisJob(uploadRes.image_id);
      onNext({ imageId: uploadRes.image_id, jobId: jobRes.job_id });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load sample tile.');
      setLoadingSampleId(null);
    }
  };

  const ext = file ? getExt(file.name).replace('.', '').toUpperCase() : null;

  return (
    <div className="upload-page scroll-y" style={{ justifyContent: 'flex-start', padding: '32px 24px' }}>
      {/* Hero */}
      <div className="upload-hero animate-slide-up" style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--emerald)', marginBottom: 8, textTransform: 'uppercase' }}>
          Ginkgo Spatial Planning Intelligence
        </div>
        <h1 className="upload-title" style={{ fontSize: 26, marginBottom: 8 }}>
          Predictive Flood & Development <span style={{ color: 'var(--emerald)' }}>Intelligence</span>
        </h1>
        <p className="upload-subtitle" style={{ fontSize: 13, maxWidth: 620 }}>
          Ingest Sentinel-2 satellite tiles (.tif, .png, .jpg) to predict flood risks, calculate MSMA 2nd Edition stormwater detention, and generate evidence-based town planning reports.
        </p>
      </div>

      {/* 1-Click Sample Tiles Section */}
      <div style={{ width: '100%', maxWidth: 740, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="label" style={{ color: 'var(--sky)' }}>⚡ Quick Load — Sentinel-2 L2A Sample Tiles</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>10m Resolution (ESA Copernicus)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {sampleTiles.map((tile) => {
            const isLoading = loadingSampleId === tile.id;
            return (
              <div
                key={tile.id}
                onClick={() => !loadingSampleId && handleSelectSample(tile.id)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                  padding: '12px 14px',
                  cursor: loadingSampleId ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loadingSampleId && !isLoading ? 0.5 : 1,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  if (!loadingSampleId) {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--sky)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                    {tile.name}
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                    background: 'rgba(56,189,248,0.12)', color: 'var(--sky)',
                  }}>
                    {tile.dominant_cover}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, margin: '4px 0 6px' }}>
                  {tile.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
                  <span>{formatBytes(tile.size_bytes)} • GeoTIFF</span>
                  <span style={{ color: 'var(--sky)', fontWeight: 600 }}>
                    {isLoading ? '⏳ Analyzing…' : '▶ Load & Analyze'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="divider" style={{ maxWidth: 740, margin: '8px 0 16px' }} />

      {/* Drop Zone */}
      <div
        className={`drop-zone${dragOver ? ' drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
        style={{ maxWidth: 740, minHeight: 140, padding: 20 }}
      >
        <input
          id="file-input"
          type="file"
          accept={ACCEPTED}
          style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="drop-zone-icon" style={{ width: 44, height: 44, fontSize: 20 }}>🛰️</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
              {file ? file.name : 'Or Upload Custom Imagery (TIFF, GeoTIFF, PNG, JPG)'}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
              {file ? `${formatBytes(file.size)} • ${ext}` : 'Drag & drop or browse from local filesystem'}
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner" style={{ maxWidth: 740, width: '100%', marginTop: 10 }}>
          ⚠ {error}
        </div>
      )}

      {/* Analyze Custom File CTA */}
      {file && (
        <button
          className="btn btn-primary btn-lg"
          onClick={handleAnalyzeFile}
          disabled={uploading}
          style={{ minWidth: 220, marginTop: 12 }}
        >
          {uploading ? (
            <><span className="animate-spin" style={{ display: 'inline-block' }}>⟳</span> Uploading…</>
          ) : (
            <><span>⬡</span> Analyze Custom File</>
          )}
        </button>
      )}
    </div>
  );
};
