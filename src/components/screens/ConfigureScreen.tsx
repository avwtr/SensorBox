import {
  ALL_METRICS,
  DEFAULT_SELECTED,
  type SensorMetric,
} from "../../lib/metrics";

interface Props {
  selected: SensorMetric[];
  onToggle: (metric: SensorMetric) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function ConfigureScreen({
  selected,
  onToggle,
  onContinue,
  onBack,
}: Props) {
  const canContinue = selected.length >= 1;

  return (
    <div className="screen screen-inner">
      <div className="screen-top">
        <button type="button" className="link-back" onClick={onBack}>
          ← Back
        </button>
        <div className="page-header">
          <h1 className="page-title">What to record</h1>
          <p className="page-desc">Pick at least one. You can change this anytime.</p>
        </div>
      </div>

      <ul className="metric-list">
        {ALL_METRICS.map((m) => {
          const on = selected.includes(m.key);
          return (
            <li key={m.key}>
              <button
                type="button"
                className={`metric-row ${on ? "on" : ""}`}
                onClick={() => onToggle(m.key)}
                aria-pressed={on}
              >
                <span className="metric-row-label">{m.label}</span>
                <span className="metric-row-unit">{m.unit}</span>
                <span className="metric-check" aria-hidden>
                  {on ? "✓" : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className="btn-primary"
        disabled={!canContinue}
        onClick={onContinue}
      >
        Continue
      </button>
    </div>
  );
}

export { DEFAULT_SELECTED };
