// Ginkgo Rebuild — API Client & Standalone Engine
// Supports both Standalone Client-Side Mode (for Cloudflare Pages / no-backend demos)
// and Live Backend Mode (connecting to FastAPI Python backend on localhost:8000).

import type {
  UploadResponse,
  JobStatusResponse,
  GenerateReportResponse,
  SampleTileInfo,
  PipelineStep,
} from '../types';
import {
  DEMO_SAMPLE_TILES,
  MOCK_ANALYSIS_DATABASE,
  generateGenericAnalysisResult,
} from './mockData';

// ── Master Mode Configuration ────────────────────────────────────────────────
// Set STANDALONE_MODE to true for Cloudflare Pages / client-side autonomous demo.
// Set STANDALONE_MODE to false to route calls to the live Python FastAPI backend.
// Can also be overridden via .env: VITE_STANDALONE_MODE="false"
export const STANDALONE_MODE = import.meta.env.VITE_STANDALONE_MODE !== 'false';

const API_BASE = ''; // Vite dev proxy -> http://localhost:8000

// ── In-Memory Demo Engine State ──────────────────────────────────────────────
interface RegisteredImage {
  id: string;
  name: string;
  previewUrl: string;
  sizeBytes: number;
}

const registeredImages = new Map<string, RegisteredImage>();
const simulatedJobs = new Map<string, JobStatusResponse>();

// Pre-register official sample tiles
DEMO_SAMPLE_TILES.forEach((t) => {
  registeredImages.set(t.id, {
    id: t.id,
    name: t.name,
    previewUrl: t.preview_url || `/samples/${t.filename}`,
    sizeBytes: t.size_bytes,
  });
});

const DEFAULT_PIPELINE_STEPS = [
  'validate',
  'extract_metadata',
  'generate_preview',
  'preprocess',
  'detect_areas',
  'score_areas',
  'generate_explanations',
  'classify_zones',
  'finalize',
];

const STEP_SUCCESS_MESSAGES: Record<string, string> = {
  validate: 'Satellite raster structure and CRS integrity verified.',
  extract_metadata: '512×512 GeoTIFF EPSG:4326 affine grid extracted.',
  generate_preview: '10m GSD multi-spectral visual preview generated.',
  preprocess: 'NDVI (0.44) · Built-up (30.0%) · Vegetation (40.0%) · DEM Slope.',
  detect_areas: '4 candidate planning sectors delineated.',
  score_areas: 'Random Forest (94.2% acc) & Hydrological ML risk models executed.',
  generate_explanations: 'Gemini statutory planning narratives synthesized.',
  classify_zones: 'Akta 172 statutory zoning assigned (R1, R2, GI, A).',
  finalize: 'MSMA 2nd Ed. OSD detention (4,875 m³) and rainfall scenarios synthesized.',
};

/**
 * Simulates the real-time execution of the 9-stage spatial intelligence pipeline
 */
function runSimulatedPipeline(jobId: string, imageId: string): void {
  const stepDurations = [350, 350, 350, 450, 400, 450, 450, 400, 350]; // ~3.5s total
  let currentStepIdx = 0;

  const job = simulatedJobs.get(jobId);
  if (!job) return;

  job.status = 'RUNNING';

  function executeNextStep() {
    const currentJob = simulatedJobs.get(jobId);
    if (!currentJob) return;

    if (currentStepIdx >= DEFAULT_PIPELINE_STEPS.length) {
      // Pipeline Complete
      const regImg = registeredImages.get(imageId);
      const customPreview = regImg?.previewUrl;
      const builder = MOCK_ANALYSIS_DATABASE[imageId];

      const finalResult = builder
        ? builder(jobId, imageId, customPreview)
        : generateGenericAnalysisResult(jobId, imageId, customPreview, regImg?.name);

      currentJob.status = 'COMPLETE';
      currentJob.result = finalResult;
      currentJob.updated_at = new Date().toISOString();
      return;
    }

    const stepName = DEFAULT_PIPELINE_STEPS[currentStepIdx];
    const duration = stepDurations[currentStepIdx] || 400;

    // Set current step to running
    currentJob.steps = currentJob.steps.map((s) =>
      s.name === stepName ? { ...s, status: 'running', started_at: new Date().toISOString() } : s
    );
    currentJob.updated_at = new Date().toISOString();

    setTimeout(() => {
      const activeJob = simulatedJobs.get(jobId);
      if (!activeJob) return;

      // Set current step to complete
      activeJob.steps = activeJob.steps.map((s) =>
        s.name === stepName
          ? {
              ...s,
              status: 'complete',
              message: STEP_SUCCESS_MESSAGES[stepName] || 'Stage complete.',
              completed_at: new Date().toISOString(),
            }
          : s
      );
      activeJob.updated_at = new Date().toISOString();

      currentStepIdx++;
      executeNextStep();
    }, duration);
  }

  // Start stage 1
  executeNextStep();
}

// ── Image Upload & Sample Loading ─────────────────────────────────────────────
export async function uploadImage(file: File): Promise<UploadResponse> {
  if (STANDALONE_MODE) {
    const imageId = `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const previewUrl = URL.createObjectURL(file);

    registeredImages.set(imageId, {
      id: imageId,
      name: file.name,
      previewUrl,
      sizeBytes: file.size,
    });

    return {
      image_id: imageId,
      filename: file.name,
      file_size_bytes: file.size,
      metadata: {
        image_id: imageId,
        filename: file.name,
        file_size_bytes: file.size,
        file_format: file.type || 'image/tiff',
        width: 512,
        height: 512,
        bands: 4,
        dtype: 'uint16',
        crs: 'EPSG:4326 (WGS 84)',
        uploaded_at: new Date().toISOString(),
        preview_url: previewUrl,
      },
      message: `Uploaded ${file.name} successfully (Client-Side Demo Engine)`,
    };
  }

  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_BASE}/api/images/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function fetchSampleTiles(): Promise<SampleTileInfo[]> {
  if (STANDALONE_MODE) {
    return DEMO_SAMPLE_TILES;
  }

  const res = await fetch(`${API_BASE}/api/images/samples`);
  if (!res.ok) {
    throw new Error('Failed to fetch sample tiles');
  }
  return res.json();
}

export async function loadSampleTile(sampleId: string): Promise<UploadResponse> {
  if (STANDALONE_MODE) {
    const sample = DEMO_SAMPLE_TILES.find((t) => t.id === sampleId) || DEMO_SAMPLE_TILES[0];
    const previewUrl = sample.preview_url || `/samples/${sample.filename}`;

    registeredImages.set(sample.id, {
      id: sample.id,
      name: sample.name,
      previewUrl,
      sizeBytes: sample.size_bytes,
    });

    return {
      image_id: sample.id,
      filename: sample.filename,
      file_size_bytes: sample.size_bytes,
      metadata: {
        image_id: sample.id,
        filename: sample.filename,
        file_size_bytes: sample.size_bytes,
        file_format: 'image/tiff',
        width: 512,
        height: 512,
        bands: 4,
        dtype: 'uint16',
        crs: 'EPSG:4326 (WGS 84)',
        uploaded_at: new Date().toISOString(),
        preview_url: previewUrl,
      },
      message: `Loaded sample tile: ${sample.name}`,
    };
  }

  const res = await fetch(`${API_BASE}/api/images/samples/${sampleId}/load`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to load sample tile');
  }
  return res.json();
}

// ── Analysis Job ───────────────────────────────────────────────────────────────
export async function createAnalysisJob(imageId: string): Promise<{ job_id: string }> {
  if (STANDALONE_MODE) {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const steps: PipelineStep[] = DEFAULT_PIPELINE_STEPS.map((name) => ({
      name,
      status: 'pending',
      message: null,
      started_at: null,
      completed_at: null,
    }));

    const jobStatus: JobStatusResponse = {
      job_id: jobId,
      image_id: imageId,
      status: 'PENDING',
      steps,
      result: null,
      error: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    simulatedJobs.set(jobId, jobStatus);

    // Run async simulation
    setTimeout(() => runSimulatedPipeline(jobId, imageId), 100);

    return { job_id: jobId };
  }

  const res = await fetch(`${API_BASE}/api/analysis/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_id: imageId, model_preference: 'flood_rf' }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Job creation failed');
  }
  return res.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  if (STANDALONE_MODE) {
    const job = simulatedJobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    return { ...job };
  }

  const res = await fetch(`${API_BASE}/api/analysis/jobs/${jobId}`);
  if (!res.ok) {
    throw new Error(`Job poll failed: ${res.status}`);
  }
  return res.json();
}

// ── Reports ────────────────────────────────────────────────────────────────────
export async function generateReport(
  jobId: string,
  formats: string[] = ['pdf', 'json', 'geojson']
): Promise<GenerateReportResponse> {
  if (STANDALONE_MODE) {
    return {
      report_id: `report_${jobId.slice(0, 8)}`,
      job_id: jobId,
      exports: formats.map((fmt) => ({
        format: fmt,
        url: `#export-${fmt}`,
        size_bytes: 102400,
      })),
      generated_at: new Date().toISOString(),
      disclaimer: 'Statutory planning decision support preliminary screening.',
    };
  }

  const res = await fetch(`${API_BASE}/api/reports/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId, formats }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Report generation failed');
  }
  return res.json();
}

export async function generatePdfReport(jobId: string): Promise<GenerateReportResponse> {
  return generateReport(jobId, ['pdf', 'json', 'geojson']);
}

export function getPdfDownloadUrl(jobId: string): string {
  if (STANDALONE_MODE) return `#pdf-${jobId}`;
  return `${API_BASE}/api/reports/${jobId}/download/pdf`;
}

export function getGeoJsonDownloadUrl(jobId: string): string {
  if (STANDALONE_MODE) return `#geojson-${jobId}`;
  return `${API_BASE}/api/reports/${jobId}/download/geojson`;
}

export function getResultDownloadUrl(jobId: string): string {
  if (STANDALONE_MODE) return `#json-${jobId}`;
  return `${API_BASE}/api/reports/${jobId}/download/json`;
}

export function getDownloadUrl(reportPath: string): string {
  if (STANDALONE_MODE) return reportPath;
  return `${API_BASE}${reportPath}`;
}

export function getPreviewUrl(previewPath: string): string {
  if (!previewPath) return '';
  if (previewPath.startsWith('blob:') || previewPath.startsWith('http://') || previewPath.startsWith('https://') || previewPath.startsWith('/')) {
    return previewPath;
  }
  return `${API_BASE}${previewPath}`;
}

// ── Health ─────────────────────────────────────────────────────────────────────
export async function checkHealth(): Promise<boolean> {
  if (STANDALONE_MODE) {
    return true;
  }
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
