import type { SensorReading } from "./types";

const DEVICE_NAME = "SENSOR BOX";

/**
 * Parse a line from EE Sensor Box firmware.
 * Compatible with BIGSIS Experiment Engine SensorService.parseSensorData.
 */
export function parseSensorData(line: string): SensorReading | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // JSON format
  if (trimmed.startsWith("{")) {
    try {
      const data = JSON.parse(trimmed) as Record<string, unknown>;
      const temp = num(data.temp ?? data.temperature);
      const pressure = num(data.pres ?? data.pressure);
      const humidity = num(data.hum ?? data.humidity);
      const gas = num(data.gas ?? data.volatileGas ?? data.voc);

      if (temp === undefined && pressure === undefined && humidity === undefined && gas === undefined) {
        return null;
      }

      return {
        timestamp: Date.now(),
        temperature: temp,
        pressure,
        humidity,
        volatileGas: gas,
        deviceName: DEVICE_NAME,
      };
    } catch {
      return null;
    }
  }

  // Tab-separated key:value (primary firmware format)
  const kvPairs: Record<string, number> = {};
  const segments = trimmed.split(/[\t\n]+/);

  for (const segment of segments) {
    const match = segment.match(/(\w+):([\d.]+)/);
    if (match) {
      kvPairs[match[1]] = parseFloat(match[2]);
    }
  }

  if (Object.keys(kvPairs).length === 0) return null;

  const tempC =
    kvPairs.tempF !== undefined ? ((kvPairs.tempF - 32) * 5) / 9 : undefined;
  const pressureHPa =
    kvPairs.pressure !== undefined ? kvPairs.pressure * 1013.25 : undefined;

  return {
    timestamp: Date.now(),
    temperature: tempC,
    pressure: pressureHPa,
    humidity: kvPairs.humidity,
    volatileGas: kvPairs.voc,
    deviceName: DEVICE_NAME,
  };
}

function num(value: unknown): number | undefined {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}
