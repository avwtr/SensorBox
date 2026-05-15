import type { SensorReading } from "./types";

export type SensorMetric = "temperature" | "humidity" | "pressure" | "volatileGas";

export interface MetricConfig {
  key: SensorMetric;
  label: string;
  unit: string;
  hint: string;
}

export const ALL_METRICS: MetricConfig[] = [
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    hint: "Ambient air temperature",
  },
  {
    key: "humidity",
    label: "Humidity",
    unit: "% RH",
    hint: "Relative humidity",
  },
  {
    key: "pressure",
    label: "Pressure",
    unit: "hPa",
    hint: "Barometric pressure",
  },
  {
    key: "volatileGas",
    label: "Volatile gases",
    unit: "VOC index",
    hint: "SGP40 volatile organic compound index",
  },
];

export function readingValue(
  reading: SensorReading,
  metric: SensorMetric,
): number | undefined {
  return reading[metric];
}

export const DEFAULT_SELECTED: SensorMetric[] = ALL_METRICS.map((m) => m.key);
