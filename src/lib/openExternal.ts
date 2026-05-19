import { openUrl } from "@tauri-apps/plugin-opener";

/** Open a URL in the system browser (Tauri) or a new tab (web preview). */
export async function openExternal(url: string): Promise<void> {
  try {
    await openUrl(url);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
