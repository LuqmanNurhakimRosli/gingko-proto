// Ginkgo Rebuild — Processing Page (State 2)
// Clean light-theme pipeline progress monitor (Felt × Palantir style)

import { useEffect, type FC } from 'react';
import { useJob } from '../hooks/useJob';
import { getPreviewUrl } from '../services/api';
import type { AnalysisResult } from '../types';

const STEP_LABELS: Record<string, string> = {
  validate:              'Validate File Integrity',
  extract_metadata:      'Extract GeoTIFF Metadata & Affine Grid',
  generate_preview:      'Generate High-Resolution Preview',
  preprocess:            'Compute 5-Class Land Cover & Spectral Indices',
  detect_areas:          'Segment Planning Zones & Sectors',
  score_areas:           'Run Hydrological ML Risk Models',
  generate_explanations: 'Synthesize Multidisciplinary Planning Brief',
  classify_zones:        'Classify Statutory Akta 172 Zones',
  finalize:              'Synthesize Rainfall Scenarios & MSMA OSD',
};

interface ProcessingPageProps {
  jobId: string;
  imageId: string;
  onComplete: (result: AnalysisResult) => void;
  onError: () => void;
}

export const ProcessingPage: FC<ProcessingPageProps> = ({ jobId, imageId, onComplete, onError }) => {
  const { job } = useJob(jobId);

  useEffect(() => {
    if (!job) return;
    if ((job.status === 'COMPLETE' || job.status === 'PARTIAL') && job.result) {
      const t = setTimeout(() => onComplete(job.result!), 600);
      return () => clearTimeout(t);
    }
    if (job.status === 'FAILED') {
      setTimeout(onError, 800);
    }
  }, [job?.status]);

  const steps = job?.steps ?? [];
  const runningStep = steps.find(s => s.status === 'running');
  const completed = steps.filter(s => s.status === 'complete').length;
  const total = steps.length || 9;

  const previewUrl = (() => {
    if (job?.result?.preview_url) return getPreviewUrl(job.result.preview_url);
    return getPreviewUrl(`/previews/${imageId}_preview.png`);
  })();

  return (
    <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 52px)', background: '#F7F8F7' }}>
      {/* Left Preview Box */}
      <div style={{
        flex: 1, position: 'relative', background: '#FFFFFF', borderRight: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'hidden',
      }}>
        <img
          src={previewUrl}
          alt="Satellite preview"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 6, boxShadow: 'var(--shadow-sm)' }}
        />

        {/* Floating Bottom Progress Bar */}
        <div style={{
          position: 'absolute', bottom: 20, left: 24, right: 24,
          background: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(8px)',
          borderRadius: 6, border: '1px solid var(--border)', padding: '12px 16px',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {runningStep ? STEP_LABELS[runningStep.name] ?? runningStep.name : 'Initializing spatial models…'}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {completed}/{total}
            </span>
          </div>
          <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: 'var(--brand-green)',
              width: `${(completed / total) * 100}%`,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Right Pipeline Step List */}
      <div style={{
        width: 360, background: '#FFFFFF', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Spatial Intelligence Pipeline</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Job: {jobId.slice(0, 8)} • {job?.status ?? 'RUNNING'}
          </div>
        </div>

        <div className="scroll-y" style={{ flex: 1, padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {steps.map((step) => {
            const isDone = step.status === 'complete';
            const isRun = step.status === 'running';

            return (
              <div key={step.name} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  background: isDone ? 'var(--brand-green-light)' : isRun ? '#FEF3C7' : '#F3F4F6',
                  color: isDone ? 'var(--brand-green)' : isRun ? '#D97706' : '#9CA3AF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, border: `1px solid ${isDone ? 'var(--brand-green)' : isRun ? '#D97706' : '#E5E7EB'}`,
                }}>
                  {isDone ? '✓' : isRun ? '⟳' : '○'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 11, fontWeight: isDone || isRun ? 600 : 400,
                    color: isDone || isRun ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}>
                    {STEP_LABELS[step.name] ?? step.name}
                  </div>
                  {step.message && (
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 1 }}>
                      {step.message}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-secondary)' }}>
          {job?.status === 'COMPLETE' || job?.status === 'PARTIAL' ? (
            <span style={{ color: 'var(--brand-green)', fontWeight: 600 }}>✓ Analysis synthesized — opening workspace…</span>
          ) : (
            <span>Processing remote sensing rasters…</span>
          )}
        </div>
      </div>
    </div>
  );
};
