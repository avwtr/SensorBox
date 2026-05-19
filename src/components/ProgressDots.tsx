import type { AppScreen } from "../lib/types";

const FLOW: AppScreen[] = ["configure", "connect", "session", "export"];

interface Props {
  current: AppScreen;
}

export function ProgressDots({ current }: Props) {
  if (current === "welcome") return null;
  const idx = FLOW.indexOf(current);

  return (
    <div className="progress-dots" aria-label="Progress">
      {FLOW.map((step, i) => (
        <span
          key={step}
          className={`dot ${i <= idx ? "active" : ""} ${i === idx ? "current" : ""}`}
        />
      ))}
    </div>
  );
}
