import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAutoSelectPort,
  isLikelySensorBoxPort,
} from "../lib/portDetection";
import { parseSensorData } from "../lib/sensorParser";
import type {
  SensorConnectionStatus,
  SensorReading,
  SerialPortInfo,
} from "../lib/types";

const UI_THROTTLE_MS = 400;

export function useSensorBox() {
  const [ports, setPorts] = useState<SerialPortInfo[]>([]);
  const [selectedPort, setSelectedPort] = useState("");
  const [status, setStatus] = useState<SensorConnectionStatus>({ connected: false });
  const [liveReading, setLiveReading] = useState<SensorReading | null>(null);
  const lastUiUpdate = useRef(0);
  const userPickedPort = useRef(false);

  const detectedPort = getAutoSelectPort(ports);

  const applyAutoSelect = useCallback((list: SerialPortInfo[]) => {
    if (userPickedPort.current) return;
    const auto = getAutoSelectPort(list);
    setSelectedPort((prev) => {
      if (auto) return auto.name;
      if (prev && list.some((p) => p.name === prev && isLikelySensorBoxPort(p))) {
        return prev;
      }
      return "";
    });
  }, []);

  const refreshPorts = useCallback(async () => {
    try {
      const list = await invoke<SerialPortInfo[]>("list_serial_ports");
      setPorts(list);
      applyAutoSelect(list);
    } catch (e) {
      setStatus((s) => ({
        ...s,
        error: e instanceof Error ? e.message : String(e),
      }));
    }
  }, [applyAutoSelect]);

  const selectPort = useCallback((name: string) => {
    userPickedPort.current = true;
    setSelectedPort(name);
  }, []);

  useEffect(() => {
    void refreshPorts();
    const id = window.setInterval(() => void refreshPorts(), 2500);
    return () => clearInterval(id);
  }, [refreshPorts]);

  useEffect(() => {
    const unsubs: Array<() => void> = [];

    void (async () => {
      unsubs.push(
        await listen<string>("sensor-line", (event) => {
          const reading = parseSensorData(event.payload);
          if (!reading) return;

          const now = Date.now();
          if (now - lastUiUpdate.current < UI_THROTTLE_MS) return;
          lastUiUpdate.current = now;

          setLiveReading(reading);
          setStatus((s) => ({
            ...s,
            connected: true,
            lastReading: reading,
            error: undefined,
          }));
        }),
      );

      unsubs.push(
        await listen<string>("sensor-error", (event) => {
          setStatus((s) => ({
            ...s,
            connected: false,
            error: event.payload,
          }));
        }),
      );

      unsubs.push(
        await listen("sensor-disconnected", () => {
          setStatus((s) => ({ ...s, connected: false }));
          setLiveReading(null);
        }),
      );
    })();

    return () => unsubs.forEach((fn) => fn());
  }, []);

  const connect = useCallback(async () => {
    const port = ports.find((p) => p.name === selectedPort);
    if (!port || !isLikelySensorBoxPort(port)) {
      setStatus((s) => ({
        ...s,
        error: "Plug in your Sensor Box via USB — no device detected yet.",
      }));
      return false;
    }
    try {
      await invoke("connect_serial", { portName: selectedPort });
      setStatus({
        connected: true,
        portName: selectedPort,
        deviceName: "SENSOR BOX",
        error: undefined,
      });
      return true;
    } catch (e) {
      setStatus({
        connected: false,
        error: e instanceof Error ? e.message : String(e),
      });
      return false;
    }
  }, [selectedPort, ports]);

  const disconnect = useCallback(async () => {
    try {
      await invoke("disconnect_serial");
    } catch {
      /* ignore */
    }
    setStatus({ connected: false });
    setLiveReading(null);
  }, []);

  return {
    ports,
    detectedPort,
    selectedPort,
    setSelectedPort: selectPort,
    status,
    liveReading,
    refreshPorts,
    connect,
    disconnect,
  };
}
