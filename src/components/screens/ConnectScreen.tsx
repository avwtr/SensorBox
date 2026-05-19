import { useState } from "react";
import { getManualSelectPorts } from "../../lib/portDetection";
import type { SerialPortInfo } from "../../lib/types";

interface Props {
  ports: SerialPortInfo[];
  detected: SerialPortInfo | null;
  selectedPort: string;
  connected: boolean;
  connecting: boolean;
  autoConnecting: boolean;
  error?: string;
  onSelectPort: (name: string) => void;
  onRefresh: () => void;
  onConnect: () => void;
  onBack: () => void;
  onLaunch: () => void;
}

export function ConnectScreen({
  ports,
  detected,
  selectedPort,
  connected,
  connecting,
  autoConnecting,
  error,
  onSelectPort,
  onRefresh,
  onConnect,
  onBack,
  onLaunch,
}: Props) {
  const [manual, setManual] = useState(false);
  const busy = connecting || autoConnecting;

  return (
    <div className="screen screen-inner">
      <div className="screen-top">
        <button type="button" className="link-back" onClick={onBack}>
          ← Back
        </button>
        <div className="page-header">
          <h1 className="page-title">Connect</h1>
        </div>
      </div>

      {detected && !manual && (
        <div className="status-card status-card-ok">
          <p className="status-title">
            {connected ? "Ready" : busy ? "Connecting…" : "Sensor Box found"}
          </p>
          <p className="status-sub">{detected.description}</p>
          {!connected && !busy && (
            <button type="button" className="btn-secondary" onClick={onConnect}>
              Connect
            </button>
          )}
        </div>
      )}

      {!detected && !manual && (
        <div className="status-card">
          <p className="status-title">Plug in via USB</p>
          <p className="status-sub">
            No Sensor Box detected yet. Only USB serial devices count — not
            monitors or Bluetooth.
          </p>
          <button type="button" className="btn-secondary" onClick={onRefresh}>
            Scan again
          </button>
        </div>
      )}

      {!detected && !manual && (
        <button
          type="button"
          className="link-muted"
          onClick={() => setManual(true)}
        >
          Choose port manually
        </button>
      )}

      {manual && (
        <div className="manual-block">
          {getManualSelectPorts(ports).map((port) => (
            <button
              key={port.name}
              type="button"
              className={`port-row ${selectedPort === port.name ? "on" : ""}`}
              onClick={() => onSelectPort(port.name)}
              disabled={connected || busy}
            >
              {port.description}
            </button>
          ))}
          <div className="row-btns">
            <button type="button" className="btn-secondary" onClick={onRefresh}>
              Scan
            </button>
            {selectedPort && !connected && (
              <button type="button" className="btn-primary" onClick={onConnect}>
                Connect
              </button>
            )}
          </div>
          <button type="button" className="link-muted" onClick={() => setManual(false)}>
            Back
          </button>
        </div>
      )}

      {error && <p className="banner-error">{error}</p>}

      {connected && (
        <button type="button" className="btn-primary" onClick={onLaunch}>
          Start recording
        </button>
      )}
    </div>
  );
}
