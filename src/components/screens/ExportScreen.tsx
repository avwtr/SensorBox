import type { RecordingSession } from "../../lib/types";

interface Props {
  session: RecordingSession;
  sampleCount: number;
  onExportCsv: () => void;
  onExportJson: () => void;
  onNewReading: () => void;
}

export function ExportScreen({
  session,
  sampleCount,
  onExportCsv,
  onExportJson,
  onNewReading,
}: Props) {
  const durationMs = (session.endedAt ?? Date.now()) - session.startedAt;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);

  return (
    <div className="screen screen-export">
      <h2 className="title-section">Session complete</h2>
      <p className="lead italic">
        Your environmental readings have been captured and are ready to export.
      </p>

      <dl className="summary-grid">
        <div>
          <dt>Duration</dt>
          <dd>
            {minutes}m {seconds}s
          </dd>
        </div>
        <div>
          <dt>Samples</dt>
          <dd>{sampleCount}</dd>
        </div>
        <div>
          <dt>Ended</dt>
          <dd>
            {session.endedAt
              ? new Date(session.endedAt).toLocaleString()
              : "—"}
          </dd>
        </div>
      </dl>

      <div className="row actions export-actions">
        <button type="button" className="btn-primary" onClick={onExportCsv}>
          Export CSV
        </button>
        <button type="button" className="secondary" onClick={onExportJson}>
          Export JSON
        </button>
      </div>

      <button type="button" className="btn-text" onClick={onNewReading}>
        Start a new reading
      </button>
    </div>
  );
}
