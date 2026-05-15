import { isLikelySensorBoxPort, isPreferredCallout } from "../../lib/portDetection";
import type { SerialPortInfo } from "../../lib/types";

interface Props {
  ports: SerialPortInfo[];
  recommended: SerialPortInfo | null;
  selectedPort: string;
  connected: boolean;
  connecting: boolean;
  error?: string;
  onSelectPort: (name: string) => void;
  onRefresh: () => void;
  onConnect: () => void;
  onBack: () => void;
  onLaunch: () => void;
}

function portLabel(port: SerialPortInfo, recommended: SerialPortInfo | null): string {
  if (recommended && port.name === recommended.name) {
    return "Recommended — likely your Sensor Box";
  }
  if (isLikelySensorBoxPort(port)) return "Possible Sensor Box (USB serial bridge)";
  if (/bluetooth|debug-console/i.test(port.name)) return "System port — not Sensor Box";
  return "Unlikely to be Sensor Box";
}

export function ConnectScreen({
  ports,
  recommended,
  selectedPort,
  connected,
  connecting,
  error,
  onSelectPort,
  onRefresh,
  onConnect,
  onBack,
  onLaunch,
}: Props) {
  const sorted = [...ports].sort((a, b) => {
    const score = (p: SerialPortInfo) =>
      (recommended?.name === p.name ? 1000 : 0) +
      (isLikelySensorBoxPort(p) ? 100 : 0) +
      (isPreferredCallout(p) ? 10 : 0);
    return score(b) - score(a);
  });

  return (
    <div className="screen screen-connect">
      <button type="button" className="btn-text back-link" onClick={onBack}>
        ← Back
      </button>

      <h2 className="title-section">Connect your Sensor Box</h2>
      <p className="lead italic">
        Plug the device in via USB. We highlight the port that usually matches the
        CP2102 / ESP32 bridge on Sensor Box hardware.
      </p>

      {recommended && !connected && (
        <div className="callout callout-recommended">
          <p className="callout-title">Suggested port</p>
          <p className="callout-port">{recommended.name}</p>
          <p className="callout-desc">{recommended.description}</p>
          <p className="callout-hint italic">
            On Mac, choose the <strong>cu.</strong> port (not tty.) for this device.
          </p>
        </div>
      )}

      <div className="port-list">
        {sorted.length === 0 ? (
          <p className="muted">No serial ports detected. Plug in Sensor Box and tap Refresh.</p>
        ) : (
          sorted.map((port) => {
            const isRec = recommended?.name === port.name;
            const selected = selectedPort === port.name;
            return (
              <button
                key={port.name}
                type="button"
                className={`port-card ${selected ? "selected" : ""} ${isRec ? "recommended" : ""}`}
                onClick={() => onSelectPort(port.name)}
                disabled={connected}
              >
                <span className="port-card-badge">{portLabel(port, recommended)}</span>
                <span className="port-card-name">{port.name}</span>
                <span className="port-card-desc">{port.description}</span>
              </button>
            );
          })
        )}
      </div>

      <div className="row actions">
        <button type="button" className="secondary" onClick={onRefresh} disabled={connected || connecting}>
          Refresh ports
        </button>
        {!connected ? (
          <button
            type="button"
            className="btn-primary"
            onClick={onConnect}
            disabled={!selectedPort || connecting}
          >
            {connecting ? "Connecting…" : "Connect"}
          </button>
        ) : (
          <span className="badge on">Connected</span>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {connected && (
        <div className="connect-footer">
          <p className="muted italic">Live link established. You may begin your session.</p>
          <button type="button" className="btn-primary btn-large" onClick={onLaunch}>
            Launch session
          </button>
        </div>
      )}
    </div>
  );
}
