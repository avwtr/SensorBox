import { useMemo, useState } from "react";
import { ConfirmModal } from "../ConfirmModal";
import { SensorChart } from "../SensorChart";
import {
  ALL_METRICS,
  readingValue,
  type SensorMetric,
} from "../../lib/metrics";
import { computeStats, fmtStat } from "../../lib/stats";
import type { RecordingSession, SensorReading } from "../../lib/types";

const CHART_COLORS: Record<SensorMetric, string> = {
  temperature: "#A0FFDD",
  humidity: "#ffffff",
  pressure: "rgba(160, 255, 221, 0.65)",
  volatileGas: "rgba(255, 255, 255, 0.75)",
};

interface Props {
  session: RecordingSession;
  liveReading: SensorReading | null;
  elapsedMs: number;
  onConclude: () => void;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function SessionScreen({
  session,
  liveReading,
  elapsedMs,
  onConclude,
}: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const metrics = session.selectedMetrics;

  const metricConfigs = useMemo(
    () => ALL_METRICS.filter((m) => metrics.includes(m.key)),
    [metrics],
  );

  const readings = session.readings;

  return (
    <div className="screen screen-session">
      <div className="session-topbar">
        <div>
          <p className="eyebrow">Recording</p>
          <p className="timer">{formatDuration(elapsedMs)}</p>
        </div>
        <button type="button" className="danger" onClick={() => setShowConfirm(true)}>
          Conclude
        </button>
      </div>

      <div className="stats-row">
        {metricConfigs.map((m) => {
          const values = readings.map((r) => readingValue(r, m.key));
          if (liveReading) {
            const live = readingValue(liveReading, m.key);
            if (live !== undefined) values.push(live);
          }
          const stats = computeStats(values);
          return (
            <article key={m.key} className="stat-card">
              <h3 className="stat-label">{m.label}</h3>
              <p className="stat-current">
                {fmtStat(stats.current)}
                <span className="stat-unit">{m.unit}</span>
              </p>
              <dl className="stat-meta">
                <div>
                  <dt>Min</dt>
                  <dd>{fmtStat(stats.min)}</dd>
                </div>
                <div>
                  <dt>Avg</dt>
                  <dd>{fmtStat(stats.avg)}</dd>
                </div>
                <div>
                  <dt>Max</dt>
                  <dd>{fmtStat(stats.max)}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>

      <div className="charts-stack">
        {metricConfigs.map((m) => (
          <SensorChart
            key={m.key}
            metric={m.key}
            label={m.label}
            unit={m.unit}
            readings={
              liveReading ? [...readings, liveReading] : readings
            }
            sessionStart={session.startedAt}
            color={CHART_COLORS[m.key]}
          />
        ))}
      </div>

      <ConfirmModal
        open={showConfirm}
        title="Conclude session?"
        message="This will stop recording. You can export your data on the next screen."
        confirmLabel="Conclude session"
        onConfirm={() => {
          setShowConfirm(false);
          onConclude();
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
