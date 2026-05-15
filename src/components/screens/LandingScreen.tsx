import {
  ALL_METRICS,
  DEFAULT_SELECTED,
  type SensorMetric,
} from "../../lib/metrics";

interface Props {
  selected: SensorMetric[];
  onToggle: (metric: SensorMetric) => void;
  onStart: () => void;
}

export function LandingScreen({ selected, onToggle, onStart }: Props) {
  const canStart = selected.length >= 1;

  return (
    <div className="screen screen-landing">
      <div className="landing-center">
        <img
          src="/crest.png"
          alt=""
          className="landing-crest"
          width={120}
          height={120}
        />
        <p className="eyebrow">REDITUS AD NATURAM</p>
        <h1 className="title-display">Sensor Box</h1>
        <p className="subtitle italic">
          Select the environmental readings you wish to capture.
        </p>

        <fieldset className="metric-picker">
          <legend className="sr-only">Environmental variables</legend>
          {ALL_METRICS.map((m) => {
            const checked = selected.includes(m.key);
            return (
              <label
                key={m.key}
                className={`metric-option ${checked ? "checked" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(m.key)}
                />
                <span className="metric-option-body">
                  <span className="metric-option-label">{m.label}</span>
                  <span className="metric-option-hint italic">{m.hint}</span>
                </span>
              </label>
            );
          })}
        </fieldset>

        {!canStart && (
          <p className="hint-warn italic">Choose at least one reading to continue.</p>
        )}

        <button
          type="button"
          className="btn-primary btn-large"
          disabled={!canStart}
          onClick={onStart}
        >
          Start reading
        </button>
      </div>
    </div>
  );
}

export { DEFAULT_SELECTED };
