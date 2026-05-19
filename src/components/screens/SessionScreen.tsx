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
  pressure: "rgba(160, 255, 221, 0.5)",
  volatileGas: "rgba(255, 255, 255, 0.7)",
};

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface Props {
  session: RecordingSession;
  liveReading: SensorReading | null;
  elapsedMs: number;
  onConclude: () => void;
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
    <div className="screen screen-inner screen-session">
      <div className="session-head">
        <p className="session-time">{formatDuration(elapsedMs)}</p>
        <button
          type="button"
          className="btn-stop"
          onClick={() => setShowConfirm(true)}
        >
          Stop
        </button>
      </div>

      <div className="live-grid">
        {metricConfigs.map((m) => {
          const values = readings.map((r) => readingValue(r, m.key));
          if (liveReading) {
            const live = readingValue(liveReading, m.key);
            if (live !== undefined) values.push(live);
          }
          const stats = computeStats(values);
          return (
            <div key={m.key} className="live-cell">
              <span className="live-label">{m.label}</span>
              <span className="live-value">
                {fmtStat(stats.current)}
                <small>{m.unit}</small>
              </span>
              <span className="live-range">
                {fmtStat(stats.min)} – {fmtStat(stats.max)} avg {fmtStat(stats.avg)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="charts">
        {metricConfigs.map((m) => (
          <SensorChart
            key={m.key}
            metric={m.key}
            label={m.label}
            unit={m.unit}
            readings={liveReading ? [...readings, liveReading] : readings}
            sessionStart={session.startedAt}
            color={CHART_COLORS[m.key]}
          />
        ))}
      </div>

      <ConfirmModal
        open={showConfirm}
        title="Stop recording?"
        message="Your session will be saved and you can export the data."
        confirmLabel="Stop"
        onConfirm={() => {
          setShowConfirm(false);
          onConclude();
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
