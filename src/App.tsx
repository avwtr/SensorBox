import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { useCallback, useState } from "react";
import { ExportScreen } from "./components/screens/ExportScreen";
import {
  DEFAULT_SELECTED,
  LandingScreen,
} from "./components/screens/LandingScreen";
import { ConnectScreen } from "./components/screens/ConnectScreen";
import { SessionScreen } from "./components/screens/SessionScreen";
import { readingsToCsv, sessionToJson } from "./lib/export";
import type { SensorMetric } from "./lib/metrics";
import type { AppScreen } from "./lib/types";
import { useSensorBox } from "./hooks/useSensorBox";
import { useSession } from "./hooks/useSession";
import "./App.css";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("landing");
  const [selectedMetrics, setSelectedMetrics] =
    useState<SensorMetric[]>(DEFAULT_SELECTED);
  const [connecting, setConnecting] = useState(false);

  const sensor = useSensorBox();
  const sessionHook = useSession(
    screen === "session",
    sensor.liveReading,
    selectedMetrics,
  );

  const toggleMetric = (metric: SensorMetric) => {
    setSelectedMetrics((prev) => {
      if (prev.includes(metric)) {
        if (prev.length <= 1) return prev;
        return prev.filter((m) => m !== metric);
      }
      return [...prev, metric];
    });
  };

  const handleConnect = async () => {
    setConnecting(true);
    await sensor.connect();
    setConnecting(false);
  };

  const exportCsv = async () => {
    const s = sessionHook.session;
    if (!s) return;
    const path = await save({
      defaultPath: `sensorbox-${s.id.slice(0, 8)}.csv`,
      filters: [{ name: "CSV", extensions: ["csv"] }],
    });
    if (!path) return;
    await writeTextFile(path, readingsToCsv(s));
  };

  const exportJson = async () => {
    const s = sessionHook.session;
    if (!s) return;
    const path = await save({
      defaultPath: `sensorbox-${s.id.slice(0, 8)}.json`,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (!path) return;
    await writeTextFile(path, sessionToJson(s));
  };

  const startNewReading = useCallback(async () => {
    await sensor.disconnect();
    sessionHook.resetSession();
    setScreen("landing");
  }, [sensor, sessionHook]);

  return (
    <div className="app">
      {screen === "landing" && (
        <LandingScreen
          selected={selectedMetrics}
          onToggle={toggleMetric}
          onStart={() => setScreen("connect")}
        />
      )}

      {screen === "connect" && (
        <ConnectScreen
          ports={sensor.ports}
          recommended={sensor.recommendedPort}
          selectedPort={sensor.selectedPort}
          connected={sensor.status.connected}
          connecting={connecting}
          error={sensor.status.error}
          onSelectPort={sensor.setSelectedPort}
          onRefresh={() => void sensor.refreshPorts()}
          onConnect={() => void handleConnect()}
          onBack={() => setScreen("landing")}
          onLaunch={() => {
            sessionHook.startSession();
            setScreen("session");
          }}
        />
      )}

      {screen === "session" && sessionHook.session && (
        <SessionScreen
          session={sessionHook.session}
          liveReading={sensor.liveReading}
          elapsedMs={sessionHook.elapsedMs}
          onConclude={() => {
            sessionHook.concludeSession();
            setScreen("export");
          }}
        />
      )}

      {screen === "export" && sessionHook.session && (
        <ExportScreen
          session={sessionHook.session}
          sampleCount={sessionHook.session.readings.length}
          onExportCsv={() => void exportCsv()}
          onExportJson={() => void exportJson()}
          onNewReading={() => void startNewReading()}
        />
      )}
    </div>
  );
}
