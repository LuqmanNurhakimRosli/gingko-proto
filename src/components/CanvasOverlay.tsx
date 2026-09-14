// Ginkgo Rebuild — Canvas Overlay Component (Light Theme / Felt style)
import { useEffect, useRef, type FC } from 'react';
import type { AreaResult } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  HIGH_SUITABILITY:        '#08A045',
  CONDITIONAL:             '#D97706',
  FLOOD_EXPOSED:           '#DC2626',
  NO_SIGNIFICANT_INTEREST: '#64748B',
};

interface CanvasOverlayProps {
  areas: AreaResult[];
  imageWidth: number;
  imageHeight: number;
  selectedAreaId: string | null;
  highlightedAreaId?: string | null;
  visibleLayers?: Record<string, boolean>;
  onSelectArea: (areaId: string) => void;
}

export const CanvasOverlay: FC<CanvasOverlayProps> = ({
  areas,
  imageWidth,
  imageHeight,
  selectedAreaId,
  highlightedAreaId,
  visibleLayers = { floodRisk: true },
  onSelectArea,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getScale = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageWidth || !imageHeight) return { sx: 1, sy: 1 };
    return {
      sx: canvas.offsetWidth / imageWidth,
      sy: canvas.offsetHeight / imageHeight,
    };
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const { sx, sy } = getScale();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (visibleLayers.floodRisk === false) return;

    areas.forEach((area) => {
      const { x, y, width: w, height: h } = area.bounding_box;
      const cx = x * sx, cy = y * sy, cw = w * sx, ch = h * sy;
      const color = CATEGORY_COLORS[area.category] || '#64748B';
      const isSelected = area.area_id === selectedAreaId;
      const isHighlighted = area.area_id === highlightedAreaId;

      // Polygon Area Fill
      ctx.fillStyle = isHighlighted
        ? `${color}40`
        : isSelected
        ? `${color}28`
        : `${color}14`;
      ctx.fillRect(cx, cy, cw, ch);

      // Boundary Stroke
      ctx.strokeStyle = isHighlighted ? '#08A045' : color;
      ctx.lineWidth = isHighlighted ? 3.5 : isSelected ? 2.5 : 1.5;
      if (isHighlighted) {
        ctx.setLineDash([6, 3]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.strokeRect(cx, cy, cw, ch);
      ctx.setLineDash([]);

      // Zone Label Badge
      const zoneCode = area.zone_code ?? '';
      const floodScore = area.flood_risk_score !== null ? ` · Flood: ${area.flood_risk_score}` : '';
      const labelText = `${zoneCode} (${area.area_id.toUpperCase()})${floodScore}`;
      const padding = 6;
      ctx.font = `600 11px "Inter", sans-serif`;
      const textW = ctx.measureText(labelText).width;

      // Label background (clean pill)
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.fillRect(cx + 4, cy + 4, textW + padding * 2 + 14, 22);
      ctx.strokeRect(cx + 4, cy + 4, textW + padding * 2 + 14, 22);

      // Label indicator dot
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx + 4 + padding + 4, cy + 15, 3.5, 0, 2 * Math.PI);
      ctx.fill();

      // Label text
      ctx.fillStyle = '#111111';
      ctx.fillText(labelText, cx + 4 + padding + 12, cy + 19);

      // Corner Accents on selected / highlighted
      if (isSelected || isHighlighted) {
        const accent = 10;
        ctx.strokeStyle = isHighlighted ? '#08A045' : color;
        ctx.lineWidth = 3;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(cx, cy + accent);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + accent, cy);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(cx + cw - accent, cy);
        ctx.lineTo(cx + cw, cy);
        ctx.lineTo(cx + cw, cy + accent);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(cx, cy + ch - accent);
        ctx.lineTo(cx, cy + ch);
        ctx.lineTo(cx + accent, cy + ch);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(cx + cw - accent, cy + ch);
        ctx.lineTo(cx + cw, cy + ch);
        ctx.lineTo(cx + cw, cy + ch - accent);
        ctx.stroke();
      }
    });
  };

  useEffect(() => { draw(); }, [areas, selectedAreaId, highlightedAreaId, imageWidth, imageHeight, visibleLayers]);

  useEffect(() => {
    const obs = new ResizeObserver(() => draw());
    if (canvasRef.current) obs.observe(canvasRef.current);
    return () => obs.disconnect();
  }, [areas, selectedAreaId, highlightedAreaId, visibleLayers]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { sx, sy } = getScale();

    for (let i = areas.length - 1; i >= 0; i--) {
      const { x, y, width: w, height: h } = areas[i].bounding_box;
      const cx = x * sx, cy = y * sy, cw = w * sx, ch = h * sy;
      if (mx >= cx && mx <= cx + cw && my >= cy && my <= cy + ch) {
        onSelectArea(areas[i].area_id);
        return;
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        cursor: 'crosshair',
        pointerEvents: 'auto',
      }}
    />
  );
};
