import type { ReactNode } from "react";
import { openExternal } from "../lib/openExternal";

const SHOP_URL = "https://shop.experimentengine.ai/products/sensor-box";
const EE_URL = "https://www.experimentengine.ai/";
const GITHUB_URL = "https://github.com/avwtr/SensorBox";

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        void openExternal(href);
      }}
    >
      {children}
    </a>
  );
}

function FooterSep() {
  return (
    <span className="footer-dot" aria-hidden>
      ·
    </span>
  );
}

export function AppFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className={`app-footer ${compact ? "compact" : ""}`}>
      <ExternalLink href={SHOP_URL}>Get Sensor Box · $99</ExternalLink>
      <FooterSep />
      <ExternalLink href={EE_URL}>Experiment Engine</ExternalLink>
      <FooterSep />
      <ExternalLink href={GITHUB_URL}>GitHub</ExternalLink>
    </footer>
  );
}
