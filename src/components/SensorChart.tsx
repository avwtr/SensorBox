import { useId, useMemo } from "react";
import type { SensorMetric } from "../lib/metrics";
import { readingValue } from "../lib/metrics";
import type { SensorReading } from "../lib/types";

interface Props {
  metric: SensorMetric;
  label: string;
  unit: string;
  readings: SensorReading[];
  sessionStart: number;
  color: string;
}

const W = 640;
const H = 140;
const PAD = { t: 12, r: 12, b: 24, l: 44 };

export function SensorChart({
  label,
  unit,
  readings,
  sessionStart,
  color,
  metric,
}: Props) {
  const gradId = useId();

  const points = useMemo(() => {
    return readings
      .map((r) => ({
        t: r.timestamp - sessionStart,
        v: readingValue(r, metric),
      }))
      .filter((p): p is { t: number; v: number } => p.v !== undefined);
  }, [readings, sessionStart, metric]);

  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;
    const maxT = Math.max(points[points.length - 1].t, 1000);
    const vals = points.map((p) => p.v);
    let minV = Math.min(...vals);
    let maxV = Math.max(...vals);
    if (minV === maxV) {
      minV -= 1;
      maxV += 1;
    }
    const range = maxV - minV;

    const coords = points.map((p) => {
      const x = PAD.l + (p.t / maxT) * innerW;
      const y = PAD.t + innerH - ((p.v - minV) / range) * innerH;
      return `${x},${y}`;
    });

    return `M ${coords.join(" L ")}`;
  }, [points]);

  const areaD = useMemo(() => {
    if (!pathD) return "";
    const innerH = H - PAD.t - PAD.b;
    const baseline = PAD.t + innerH;
    const firstX = pathD.match(/M ([\d.]+)/)?.[1] ?? String(PAD.l);
    const lastMatch = [...pathD.matchAll(/([\d.]+),([\d.]+)/g)].pop();
    const lastX = lastMatch?.[1] ?? String(W - PAD.r);
    return `${pathD} L ${lastX},${baseline} L ${firstX},${baseline} Z`;
  }, [pathD]);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <span className="chart-label">{label}</span>
        <span className="chart-unit">{unit}</span>
      </div>
      <svg
        className="chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label} over time`}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PAD.l}
            x2={W - PAD.r}
            y1={PAD.t + (H - PAD.t - PAD.b) * f}
            y2={PAD.t + (H - PAD.t - PAD.b) * f}
            className="chart-grid"
          />
        ))}
        {areaD && <path d={areaD} fill={`url(#${gradId})`} />}
        {pathD && (
          <path d={pathD} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        )}
        {points.length === 0 && (
          <text x={W / 2} y={H / 2} textAnchor="middle" className="chart-empty">
            Awaiting data…
          </text>
        )}
      </svg>
    </div>
  );
}
