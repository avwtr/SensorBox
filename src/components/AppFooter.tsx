import type { ReactNode } from "react";
import { openExternal } from "../lib/openExternal";

const SHOP_URL = "https://shop.experimentengine.ai/products/sensor-box";
const EE_URL = "https://www.experimentengine.ai/";

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

export function AppFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className={`app-footer ${compact ? "compact" : ""}`}>
      <ExternalLink href={SHOP_URL}>Get Sensor Box · $99</ExternalLink>
      <span className="footer-dot" aria-hidden>
        ·
      </span>
      <ExternalLink href={EE_URL}>Experiment Engine</ExternalLink>
    </footer>
  );
}
