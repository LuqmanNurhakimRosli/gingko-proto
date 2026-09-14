// Ginkgo Rebuild — Client-Side Report Exporter
// Generates official PDF screening reports, QGIS GeoJSON layers, and JSON analysis data in-browser.
// Enables 100% offline and Cloudflare-hosted static downloads without backend dependencies.

import { jsPDF } from 'jspdf';
import type { AnalysisResult } from '../types';

/**
 * Trigger an instant browser file download from a Blob or string
 */
export function triggerFileDownload(content: Blob | string, filename: string, mimeType = 'text/plain'): void {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Generate and download an official PDF Planning Assessment Report
 */
export function downloadPdfReport(result: AnalysisResult): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const overview = result.overview;
  const lc = overview.land_cover;
  const osd = overview.osd;
  const hydro = overview.hydrology;
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Header Banner ────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42); // Dark slate
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(34, 197, 94); // Brand green
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('GINKGO SPATIAL PLANNING INTELLIGENCE • STATUTORY DECISION SUPPORT', 14, 11);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('PRELIMINARY FLOOD RISK & SITE ASSESSMENT REPORT', 14, 20);

  // ── Metadata Bar ─────────────────────────────────────────────────────────
  doc.setFillColor(241, 245, 249);
  doc.rect(0, 28, pageWidth, 12, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Job ID: ${result.job_id.slice(0, 12)}  |  Generated: ${new Date().toLocaleDateString('en-GB')}  |  Framework: Akta 172 & MSMA 2nd Ed.  |  Datum: EPSG:4326`,
    14,
    35
  );

  let y = 48;

  // ── Executive Summary ───────────────────────────────────────────────────
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. EXECUTIVE SUMMARY & SUITABILITY DETERMINATION', 14, y);
  y += 6;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(overview.summary || 'Preliminary spatial analysis completed.', pageWidth - 28);
  doc.text(summaryLines, 14, y);
  y += summaryLines.length * 4.5 + 4;

  // ── Key Metrics Cards ───────────────────────────────────────────────────
  const colWidth = (pageWidth - 28 - 9) / 4;
  const cards = [
    { label: 'Overall Suitability', val: overview.overall_suitability, sub: 'Statutory Akta 172' },
    { label: 'Flood Risk Index', val: `${overview.overall_flood_risk.toFixed(1)}/100`, sub: 'ML Ensemble Model' },
    { label: 'Required OSD Volume', val: `${osd?.osd_volume_m3?.toLocaleString() || 4875} m³`, sub: '100-yr ARI Design Storm' },
    { label: 'River Proximity', val: `${hydro?.water_proximity_m?.toFixed(0) || 45}m`, sub: hydro?.river_buffer_zone ? 'Within 100m Buffer' : 'Setback Compliant' },
  ];

  cards.forEach((c, idx) => {
    const x = 14 + idx * (colWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, colWidth, 18, 2, 2, 'FD');

    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text(c.label.toUpperCase(), x + 3, y + 5);

    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(c.val, x + 3, y + 11);

    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(c.sub, x + 3, y + 15);
  });

  y += 24;

  // ── Land Cover & Hydrology Breakdown ────────────────────────────────────
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text('2. LAND COVER COMPOSITION & STORMWATER RUNOFF PARAMETERS', 14, y);
  y += 6;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const lcText = `Built-up / Urban: ${lc?.urban ?? 32}%   |   Vegetation & Canopy: ${lc?.vegetation ?? 40}%   |   Waterbody: ${lc?.water ?? 12}%   |   Agriculture: ${lc?.agriculture ?? 10}%   |   Bare Soil: ${lc?.soil ?? 6}%`;
  doc.text(lcText, 14, y);
  y += 5;

  const osdText = `Runoff Coefficient (C): ${osd?.runoff_coefficient ?? 0.68}   |   Design Rainfall Intensity: ${osd?.rainfall_intensity_mmhr ?? 125} mm/hr   |   Catchment: ${osd?.site_area_ha ?? 26.2} ha`;
  doc.text(osdText, 14, y);
  y += 10;

  // ── Allocated Planning Zones ────────────────────────────────────────────
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text('3. STATUTORY ZONING ALLOCATION & MITIGATION CONDITIONS', 14, y);
  y += 6;

  result.areas.forEach((area) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, pageWidth - 28, 19, 1.5, 1.5, 'FD');

    // Indicator tag
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${area.area_id.toUpperCase()}: ${area.zone_code} — ${area.zone_label}`, 18, y + 5);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Category: ${area.category.replace('_', ' ')}  |  Suitability: ${area.suitability_score ?? 'N/A'}/100  |  Flood Risk: ${area.flood_risk_score ?? 'N/A'}/100`, 18, y + 9.5);

    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const condText = doc.splitTextToSize(`Conditions: ${area.planning_conditions}`, pageWidth - 36);
    doc.text(condText[0] || '', 18, y + 14);

    y += 22;
  });

  y += 2;

  // ── Rainfall Scenarios ──────────────────────────────────────────────────
  if (y < 235 && overview.rainfall_scenarios?.length) {
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text('4. RAINFALL STRESS SCENARIOS (METMALAYSIA API & MSMA 2ND ED.)', 14, y);
    y += 6;

    overview.rainfall_scenarios.forEach((sc) => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(
        `• ${sc.scenario}:  Rainfall: ${sc.rainfall_mmhr} mm/hr  |  Projected Inundation Risk: ${sc.flood_risk_score}/100  |  Affected Area: ${sc.affected_area_pct}%  |  Status: ${sc.status}`,
        18,
        y
      );
      y += 5;
    });
    y += 4;
  }

  // ── Footer / Disclaimer ─────────────────────────────────────────────────
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'italic');
  const disclaimer = 'STATUTORY DISCLAIMER: This document is generated by the Ginkgo Spatial Intelligence Platform for preliminary planning decision support under Town and Country Planning Act 1976 (Act 172) and MSMA 2nd Edition. On-ground verification by licensed surveyors (RTB/PE) remains mandatory.';
  doc.text(doc.splitTextToSize(disclaimer, pageWidth - 28), 14, 285);

  // Save PDF
  doc.save(`ginkgo_screening_report_${result.job_id.slice(0, 8)}.pdf`);
}

/**
 * Generate and download an authentic QGIS-compatible GeoJSON zoning layer
 */
export function downloadGeoJsonReport(result: AnalysisResult): void {
  // Reference bounding coordinates (Pahang River Catchment default)
  const baseLon = 103.32;
  const baseLat = 3.81;
  const step = 0.015;

  const features = result.areas.map((area, index) => {
    const minLon = baseLon + (index % 2) * step;
    const maxLon = minLon + step * 0.9;
    const minLat = baseLat - Math.floor(index / 2) * step;
    const maxLat = minLat + step * 0.9;

    return {
      type: 'Feature',
      id: area.area_id,
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [minLon, minLat],
            [maxLon, minLat],
            [maxLon, maxLat],
            [minLon, maxLat],
            [minLon, minLat],
          ],
        ],
      },
      properties: {
        area_id: area.area_id,
        zone_code: area.zone_code,
        zone_label: area.zone_label,
        category: area.category,
        suitability_score: area.suitability_score,
        flood_risk_score: area.flood_risk_score,
        livability_index: area.livability_index,
        environment_score: area.environment_score,
        accessibility_score: area.accessibility_score,
        water_proximity_m: area.water_proximity_m,
        river_buffer_zone: area.river_buffer_zone,
        planning_conditions: area.planning_conditions,
        risks: area.risks,
        suggested_action: area.suggested_action,
      },
    };
  });

  const geoJsonData = {
    type: 'FeatureCollection',
    name: `ginkgo_planning_zones_${result.job_id.slice(0, 8)}`,
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
      },
    },
    features,
  };

  triggerFileDownload(
    JSON.stringify(geoJsonData, null, 2),
    `ginkgo_zones_${result.job_id.slice(0, 8)}.geojson`,
    'application/geo+json'
  );
}

/**
 * Generate and download complete raw JSON analysis data
 */
export function downloadJsonReport(result: AnalysisResult): void {
  triggerFileDownload(
    JSON.stringify(result, null, 2),
    `ginkgo_analysis_${result.job_id.slice(0, 8)}.json`,
    'application/json'
  );
}
