import type { SensorMetric } from "./metrics";
import { readingValue } from "./metrics";
import type { RecordingSession } from "./types";

const METRIC_COLUMNS: { key: SensorMetric; header: string }[] = [
  { key: "temperature", header: "temperature_c" },
  { key: "humidity", header: "humidity_pct" },
  { key: "pressure", header: "pressure_hpa" },
  { key: "volatileGas", header: "volatile_gas_index" },
];

export function readingsToCsv(session: RecordingSession): string {
  const cols = METRIC_COLUMNS.filter((c) =>
    session.selectedMetrics.includes(c.key),
  );
  const header = [
    "timestamp_iso",
    "timestamp_ms",
    ...cols.map((c) => c.header),
  ].join(",");
  const rows = session.readings.map((r) =>
    [
      new Date(r.timestamp).toISOString(),
      r.timestamp,
      ...cols.map((c) => fmt(readingValue(r, c.key))),
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

export function sessionToJson(session: RecordingSession): string {
  return JSON.stringify(session, null, 2);
}

function fmt(n: number | undefined): string {
  return n === undefined ? "" : String(n);
}
