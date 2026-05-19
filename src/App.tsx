import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppFooter } from "./components/AppFooter";
import { ProgressDots } from "./components/ProgressDots";
import { ConfigureScreen, DEFAULT_SELECTED } from "./components/screens/ConfigureScreen";
import { ConnectScreen } from "./components/screens/ConnectScreen";
import { ExportScreen } from "./components/screens/ExportScreen";
import { SessionScreen } from "./components/screens/SessionScreen";
import { WelcomeScreen } from "./components/screens/WelcomeScreen";
import { readingsToCsv, sessionToJson } from "./lib/export";
import type { SensorMetric } from "./lib/metrics";
import type { AppScreen } from "./lib/types";
import { useSensorBox } from "./hooks/useSensorBox";
import { useSession } from "./hooks/useSession";
import "./App.css";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("welcome");
  const [selectedMetrics, setSelectedMetrics] =
    useState<SensorMetric[]>(DEFAULT_SELECTED);
  const [connecting, setConnecting] = useState(false);
  const [autoConnecting, setAutoConnecting] = useState(false);
  const autoConnectDone = useRef(false);

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

  const handleConnect = useCallback(async () => {
    setConnecting(true);
    const ok = await sensor.connect();
    setConnecting(false);
    return ok;
  }, [sensor]);

  useEffect(() => {
    if (screen !== "connect") {
      autoConnectDone.current = false;
      setAutoConnecting(false);
      return;
    }
    if (
      autoConnectDone.current ||
      sensor.status.connected ||
      connecting ||
      autoConnecting ||
      !sensor.detectedPort ||
      sensor.selectedPort !== sensor.detectedPort.name
    ) {
      return;
    }
    autoConnectDone.current = true;
    setAutoConnecting(true);
    void (async () => {
      await handleConnect();
      setAutoConnecting(false);
    })();
  }, [
    screen,
    sensor.detectedPort,
    sensor.selectedPort,
    sensor.status.connected,
    connecting,
    autoConnecting,
    handleConnect,
  ]);

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

  const goHome = useCallback(async () => {
    await sensor.disconnect();
    sessionHook.resetSession();
    autoConnectDone.current = false;
    setScreen("welcome");
  }, [sensor, sessionHook]);

  const showFooter = screen !== "welcome";

  return (
    <div className="app-root">
      {screen !== "welcome" && (
        <header className="app-bar">
          <span className="app-bar-brand">Sensor Box</span>
          <ProgressDots current={screen} />
        </header>
      )}

      <main className={`app-main ${screen === "welcome" ? "full" : ""}`}>
        {screen === "welcome" && (
          <WelcomeScreen onBegin={() => setScreen("configure")} />
        )}
        {screen === "configure" && (
          <ConfigureScreen
            selected={selectedMetrics}
            onToggle={toggleMetric}
            onContinue={() => setScreen("connect")}
            onBack={() => setScreen("welcome")}
          />
        )}
        {screen === "connect" && (
          <ConnectScreen
            ports={sensor.ports}
            detected={sensor.detectedPort}
            selectedPort={sensor.selectedPort}
            connected={sensor.status.connected}
            connecting={connecting}
            autoConnecting={autoConnecting}
            error={sensor.status.error}
            onSelectPort={sensor.setSelectedPort}
            onRefresh={() => void sensor.refreshPorts()}
            onConnect={() => void handleConnect()}
            onBack={() => setScreen("configure")}
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
            onExportCsv={() => void exportCsv()}
            onExportJson={() => void exportJson()}
            onDone={() => void goHome()}
          />
        )}
      </main>

      {showFooter && <AppFooter />}
    </div>
  );
}
