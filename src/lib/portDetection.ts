import type { SerialPortInfo } from "./types";

/** USB vendor IDs used by EE Sensor Box serial bridges. */
const SENSOR_BOX_VIDS = new Set([0x10c4, 0x303a, 0x1a86, 0x0403]);

const CHIP_PATTERN =
  /cp210|ch340|ftdi|esp32|uart bridge|usb to uart|usb serial converter/i;

/** macOS / Windows built-in ports — never a Sensor Box. */
export function isSystemPort(port: SerialPortInfo): boolean {
  const name = port.name.toLowerCase();
  const desc = port.description.toLowerCase();

  if (/bluetooth|debug-console|incoming-port|modem|wlan/i.test(name)) {
    return true;
  }
  if (/pci\s*\/\s*system|bluetooth|^pci$/i.test(desc)) {
    return true;
  }
  // Real Sensor Box bridges are USB devices with a vendor ID
  if (port.vid === undefined && !name.includes("usbserial") && !name.includes("usbmodem")) {
    return true;
  }

  return false;
}

/**
 * True only when we're confident this is a USB serial bridge used by Sensor Box.
 * Intentionally strict — avoids false positives from monitors, Bluetooth, etc.
 */
export function isLikelySensorBoxPort(port: SerialPortInfo): boolean {
  if (isSystemPort(port)) return false;

  if (port.vid !== undefined && SENSOR_BOX_VIDS.has(port.vid)) {
    return true;
  }

  const name = port.name.toLowerCase();
  const desc = port.description.toLowerCase();

  return (
    CHIP_PATTERN.test(desc) &&
    (name.includes("usbserial") ||
      name.includes("usbmodem") ||
      /^com\d+$/i.test(port.name))
  );
}

export function isPreferredCallout(port: SerialPortInfo): boolean {
  if (port.is_callout !== undefined) return port.is_callout;
  return port.name.includes("/dev/cu.") || /^COM\d+$/i.test(port.name);
}

function portDeviceKey(name: string): string {
  const mac = name.match(/\/dev\/(?:cu|tty)\.(.+)$/);
  if (mac) return mac[1].toLowerCase();
  return name.toLowerCase();
}

export function getLikelySensorBoxPorts(ports: SerialPortInfo[]): SerialPortInfo[] {
  const likely = ports.filter(isLikelySensorBoxPort);
  const byDevice = new Map<string, SerialPortInfo>();

  for (const port of likely) {
    const key = portDeviceKey(port.name);
    const existing = byDevice.get(key);
    if (!existing) {
      byDevice.set(key, port);
      continue;
    }
    if (isPreferredCallout(port) && !isPreferredCallout(existing)) {
      byDevice.set(key, port);
    }
  }

  return [...byDevice.values()];
}

/** Auto-use this port only when a real Sensor Box USB device is present. */
export function getAutoSelectPort(ports: SerialPortInfo[]): SerialPortInfo | null {
  const devices = getLikelySensorBoxPorts(ports);
  if (devices.length === 1) return devices[0];
  return null;
}

/** Ports a user may pick manually (hides system/debug ports). */
export function getManualSelectPorts(ports: SerialPortInfo[]): SerialPortInfo[] {
  const candidates = ports.filter((p) => !isSystemPort(p));
  const likely = getLikelySensorBoxPorts(ports);
  if (likely.length > 0) {
    return likely.filter(isPreferredCallout).length > 0
      ? likely.filter(isPreferredCallout)
      : likely;
  }
  return candidates;
}
