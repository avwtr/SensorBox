import { useCallback, useEffect, useRef, useState } from "react";
import type { SensorMetric } from "../lib/metrics";
import { readingValue } from "../lib/metrics";
import type { RecordingSession, SensorReading } from "../lib/types";

export function useSession(
  isActive: boolean,
  liveReading: SensorReading | null,
  selectedMetrics: SensorMetric[],
) {
  const [session, setSession] = useState<RecordingSession | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const sampleEveryMs = 800;
  const lastSampleAt = useRef(0);

  const isRecording = session !== null && session.endedAt === undefined && isActive;

  useEffect(() => {
    if (!isRecording) return;
    const id = window.setInterval(() => {
      setElapsedMs(Date.now() - (session?.startedAt ?? Date.now()));
    }, 200);
    return () => clearInterval(id);
  }, [isRecording, session?.startedAt]);

  useEffect(() => {
    if (!isRecording || !liveReading) return;
    const now = Date.now();
    if (now - lastSampleAt.current < sampleEveryMs) return;
    lastSampleAt.current = now;

    const hasAny = selectedMetrics.some(
      (m) => readingValue(liveReading, m) !== undefined,
    );
    if (!hasAny) return;

    setSession((prev) => {
      if (!prev || prev.endedAt) return prev;
      return { ...prev, readings: [...prev.readings, liveReading] };
    });
  }, [isRecording, liveReading, selectedMetrics]);

  const startSession = useCallback(() => {
    lastSampleAt.current = 0;
    setElapsedMs(0);
    setSession({
      id: crypto.randomUUID(),
      startedAt: Date.now(),
      readings: liveReading ? [liveReading] : [],
      selectedMetrics: [...selectedMetrics],
    });
  }, [liveReading, selectedMetrics]);

  const concludeSession = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      return { ...prev, endedAt: Date.now() };
    });
  }, []);

  const resetSession = useCallback(() => {
    setSession(null);
    setElapsedMs(0);
  }, []);

  return {
    session,
    isRecording,
    elapsedMs,
    startSession,
    concludeSession,
    resetSession,
  };
}
