import type { SensorMetric } from "./metrics";

export interface SensorReading {
  timestamp: number;
  temperature?: number;
  pressure?: number;
  humidity?: number;
  volatileGas?: number;
  deviceId?: string;
  deviceName?: string;
}

export interface SensorConnectionStatus {
  connected: boolean;
  portName?: string;
  deviceName?: string;
  lastReading?: SensorReading;
  error?: string;
}

export interface SerialPortInfo {
  name: string;
  description: string;
  likely_sensor_box: boolean;
  is_callout: boolean;
  vid?: number;
  pid?: number;
}

export type AppScreen =
  | "welcome"
  | "configure"
  | "connect"
  | "session"
  | "export";

export interface RecordingSession {
  id: string;
  startedAt: number;
  endedAt?: number;
  readings: SensorReading[];
  selectedMetrics: SensorMetric[];
}
