import type { RecordingSession } from "../../lib/types";

interface Props {
  session: RecordingSession;
  onExportCsv: () => void;
  onExportJson: () => void;
  onDone: () => void;
}

export function ExportScreen({
  session,
  onExportCsv,
  onExportJson,
  onDone,
}: Props) {
  const durationMs = (session.endedAt ?? Date.now()) - session.startedAt;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);

  return (
    <div className="screen screen-inner">
      <div className="page-header">
        <h1 className="page-title">Done</h1>
        <p className="page-desc">
          {minutes}m {seconds}s · {session.readings.length} samples
        </p>
      </div>

      <p className="export-hint">
        Sessions stay on this device until you export. Download CSV or JSON and
        keep the file wherever you like.
      </p>

      <div className="btn-stack">
        <button type="button" className="btn-primary" onClick={onExportCsv}>
          Download CSV
        </button>
        <button type="button" className="btn-secondary" onClick={onExportJson}>
          Download JSON
        </button>
        <button type="button" className="link-muted center" onClick={onDone}>
          Home
        </button>
      </div>
    </div>
  );
}
