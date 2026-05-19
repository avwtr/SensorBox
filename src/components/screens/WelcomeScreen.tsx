import { AppFooter } from "../AppFooter";

interface Props {
  onBegin: () => void;
}

export function WelcomeScreen({ onBegin }: Props) {
  return (
    <div className="screen screen-welcome">
      <div
        className="welcome-bg"
        style={{ backgroundImage: "url(/hero.png)" }}
        role="img"
        aria-label="Sensor Box by Heterodox Labs"
      />
      <div className="welcome-overlay">
        <div className="welcome-content">
          <p className="welcome-tag">Open-source desktop app</p>
          <button type="button" className="btn-begin" onClick={onBegin}>
            Begin
          </button>
        </div>
        <AppFooter compact />
      </div>
    </div>
  );
}
