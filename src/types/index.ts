// Ginkgo Rebuild — TypeScript Types
// Single source of truth for all frontend data structures.
// Mirrors backend Pydantic schemas exactly.

export type AreaCategory =
  | 'HIGH_SUITABILITY'
  | 'CONDITIONAL'
  | 'FLOOD_EXPOSED'
  | 'NO_SIGNIFICANT_INTEREST';

export type ZoneCode = 'R1' | 'R2' | 'R3' | 'C1' | 'C2' | 'A' | 'GI' | 'UT';

export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETE' | 'PARTIAL' | 'FAILED';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LandCoverComposition {
  urban: number;
  vegetation: number;
  water: number;
  soil: number;
  agriculture: number;
}

export interface TerrainProfile {
  min_elev: number;
  max_elev: number;
  slope_category: string;
  relief: number;
}

export interface HydrologicalMetrics {
  water_proximity_m: number;
  river_buffer_zone: boolean;
  buffer_compliance: string;
}

export interface OSDCalculation {
  runoff_coefficient: number;
  rainfall_intensity_mmhr: number;
  site_area_ha: number;
  osd_volume_m3: number;
  formula: string;
}

export interface RainfallScenario {
  scenario: string;
  rainfall_mmhr: number;
  flood_risk_score: number;
  affected_area_pct: number;
  status: string;
}

export interface KeyFinding {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'POSITIVE';
  evidence: string;
  location_hint: string;
  planning_implication: string;
  area_id?: string | null;
}

export interface PlanningItem {
  title: string;
  location: string;
  evidence: string;
  reason: string;
}

export interface RecommendedAction {
  priority: 'Immediate' | 'Short-term' | 'Long-term' | string;
  title: string;
  description: string;
}

export interface AreaResult {
  area_id: string;
  bounding_box: BoundingBox;
  category: AreaCategory;

  // ML-computed scores (0–100)
  suitability_score: number | null;
  livability_index: number | null;
  flood_risk_score: number | null;
  environment_score: number | null;
  accessibility_score: number | null;

  // Zone classification
  zone_code: ZoneCode | string;
  zone_label: string;
  zone_color: string;
  zone_description: string;
  planning_conditions: string;
  risks: string;

  // Area-specific land cover & hydrology
  land_cover?: LandCoverComposition;
  water_proximity_m?: number;
  river_buffer_zone?: boolean;

  // LLM text (never scores)
  explanation: string | null;
  suggested_action: string | null;
  explanation_is_llm: boolean;
  scores_are_computed: boolean;
}

export interface AnalysisOverview {
  total_areas: number;
  category_breakdown: Record<string, number>;
  summary: string | null;
  overall_suitability: 'SUITABLE' | 'CONDITIONAL' | 'NOT_SUITABLE' | string;
  overall_flood_risk: number;
  spectral_indices_available: boolean;
  spectral_indices_stats?: Record<string, { mean: number; std: number }>;
  models_used: string[];

  // Comprehensive Site Intelligence
  land_cover: LandCoverComposition;
  terrain: TerrainProfile;
  hydrology: HydrologicalMetrics;
  osd: OSDCalculation;
  rainfall_scenarios: RainfallScenario[];
  key_findings: KeyFinding[];
  constraints: PlanningItem[];
  opportunities: PlanningItem[];
  recommended_actions: RecommendedAction[];
}

export interface AnalysisResult {
  source_image_id: string;
  job_id: string;
  preview_url: string | null;
  preview_width: number;
  preview_height: number;
  areas: AreaResult[];
  overview: AnalysisOverview;
  completed_at: string;
  pipeline_stages_completed: string[];
  pipeline_stages_failed: string[];
}

export interface PipelineStep {
  name: string;
  status: 'pending' | 'running' | 'complete' | 'failed';
  message: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface JobStatusResponse {
  job_id: string;
  image_id: string;
  status: JobStatus;
  steps: PipelineStep[];
  result: AnalysisResult | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface SampleTileInfo {
  id: string;
  filename: string;
  name: string;
  description: string;
  dominant_cover: string;
  size_bytes: number;
  preview_url?: string | null;
}

export interface ImageMetadata {
  image_id: string;
  filename: string;
  file_size_bytes: number;
  file_format: string;
  width: number;
  height: number;
  bands: number;
  dtype: string;
  crs: string | null;
  uploaded_at: string;
  preview_url: string | null;
}

export interface UploadResponse {
  image_id: string;
  filename: string;
  file_size_bytes: number;
  metadata: ImageMetadata;
  message?: string;
}

export interface ReportExport {
  format: string;
  url: string;
  size_bytes: number | null;
}

export interface GenerateReportResponse {
  report_id: string;
  job_id: string;
  exports: ReportExport[];
  generated_at: string;
  disclaimer: string;
}

// UI State
export type AppState = 'upload' | 'processing' | 'dashboard' | 'report';

export interface AppData {
  imageId: string | null;
  jobId: string | null;
  result: AnalysisResult | null;
  selectedAreaId: string | null;
  highlightedAreaId?: string | null;
  reportData: GenerateReportResponse | null;
}
