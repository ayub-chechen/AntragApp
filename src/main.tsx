import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "./styles.css";
import { App } from "./App";
import { SprachAnbieter } from "./i18n/sprache";
import { DatenAnbieter } from "./lib/daten";
import { merkeInstallation } from "./lib/installieren";

merkeInstallation();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SprachAnbieter>
      <DatenAnbieter>
        <App />
      </DatenAnbieter>
    </SprachAnbieter>
  </StrictMode>,
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
