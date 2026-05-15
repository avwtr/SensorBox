import type { SerialPortInfo } from "./types";

/** USB vendor IDs common on EE Sensor Box bridges (CP210x, ESP32, CH340, FTDI). */
const SENSOR_BOX_VIDS = new Set([0x10c4, 0x303a, 0x1a86, 0x0403]);

const IGNORE_PATTERNS = [
  /bluetooth/i,
  /debug-console/i,
  /pci/i,
  /modem/i,
];

export function isLikelySensorBoxPort(port: SerialPortInfo): boolean {
  if (port.likely_sensor_box) return true;
  if (port.vid !== undefined && SENSOR_BOX_VIDS.has(port.vid)) return true;
  const text = `${port.name} ${port.description}`.toLowerCase();
  if (IGNORE_PATTERNS.some((p) => p.test(text))) return false;
  return /cp210|ch340|ftdi|esp32|usb serial|uart bridge/i.test(text);
}

/** Prefer macOS call-out ports (`cu.*`) over `tty.*` for the same device. */
export function isPreferredCallout(port: SerialPortInfo): boolean {
  if (port.is_callout !== undefined) return port.is_callout;
  return port.name.includes("/dev/cu.") || port.name.includes("COM");
}

export function rankPorts(ports: SerialPortInfo[]): SerialPortInfo[] {
  return [...ports].sort((a, b) => scorePort(b) - scorePort(a));
}

function scorePort(port: SerialPortInfo): number {
  let score = 0;
  if (isLikelySensorBoxPort(port)) score += 100;
  if (isPreferredCallout(port)) score += 50;
  if (port.name.includes("usbserial") || port.name.includes("usbmodem")) score += 10;
  if (/bluetooth|debug-console/i.test(port.name)) score -= 200;
  return score;
}

export function pickRecommendedPort(ports: SerialPortInfo[]): SerialPortInfo | null {
  const ranked = rankPorts(ports);
  const likely = ranked.filter(isLikelySensorBoxPort);
  if (likely.length === 1) return likely[0];
  const calloutLikely = likely.filter(isPreferredCallout);
  if (calloutLikely.length === 1) return calloutLikely[0];
  if (likely.length > 0 && isPreferredCallout(likely[0])) return likely[0];
  return ranked[0] ?? null;
}
