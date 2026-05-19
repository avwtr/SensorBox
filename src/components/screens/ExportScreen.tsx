import { useEffect, useState } from "react";
import {
  isCloudSaveEnabled,
  saveSessionToCloud,
} from "../../lib/sessionService";
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
  const [cloudStatus, setCloudStatus] = useState<
    "idle" | "saving" | "saved" | "skipped" | "error"
  >("idle");
  const [cloudError, setCloudError] = useState<string | null>(null);

  const durationMs = (session.endedAt ?? Date.now()) - session.startedAt;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);

  useEffect(() => {
    if (!isCloudSaveEnabled()) {
      setCloudStatus("skipped");
      return;
    }
    let cancelled = false;
    setCloudStatus("saving");
    void saveSessionToCloud(session).then((res) => {
      if (cancelled) return;
      if (res.ok) setCloudStatus("saved");
      else {
        setCloudStatus("error");
        setCloudError(res.error ?? "Save failed");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  return (
    <div className="screen screen-inner">
      <div className="page-header">
        <h1 className="page-title">Done</h1>
        <p className="page-desc">
          {minutes}m {seconds}s · {session.readings.length} samples
        </p>
      </div>

      {cloudStatus === "saving" && (
        <p className="cloud-note">Saving to cloud…</p>
      )}
      {cloudStatus === "saved" && (
        <p className="cloud-note cloud-note-ok">Session saved to cloud</p>
      )}
      {cloudStatus === "error" && (
        <p className="banner-error">{cloudError}</p>
      )}

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
