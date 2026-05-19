import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { RecordingSession } from "./types";

export interface SaveSessionResult {
  ok: boolean;
  error?: string;
  remoteId?: string;
}

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client = createClient(url, key);
  return client;
}

export function isCloudSaveEnabled(): boolean {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
  );
}

export async function saveSessionToCloud(
  session: RecordingSession,
): Promise<SaveSessionResult> {
  const supabase = getClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Cloud save not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env",
    };
  }

  if (!session.endedAt) {
    return { ok: false, error: "Session must be concluded before saving." };
  }

  const durationMs = session.endedAt - session.startedAt;

  const { data, error } = await supabase
    .from("sensor_sessions")
    .insert({
      client_session_id: session.id,
      started_at: new Date(session.startedAt).toISOString(),
      ended_at: new Date(session.endedAt).toISOString(),
      duration_ms: durationMs,
      sample_count: session.readings.length,
      selected_metrics: session.selectedMetrics,
      readings: session.readings,
      app_version: "0.1.0",
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, remoteId: data?.id as string | undefined };
}
