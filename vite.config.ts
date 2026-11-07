import { defineConfig, type Plugin } from "vitest/config";
import react from "@vitejs/plugin-react";

// Strenge Inhaltsrichtlinie: Die App lädt nur eigene Dateien und darf keine Daten an fremde Server senden.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "media-src 'self' data: blob:",
  "frame-src 'self' blob:",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join("; ");

function inhaltsrichtlinie(): Plugin {
  return {
    name: "inhaltsrichtlinie",
    // Nur im fertigen Build; die Entwicklungsumgebung von Vite braucht Inline-Skripte.
    apply: () => process.env.OHNE_CSP !== "1",
    transformIndexHtml: {
      order: "post",
      handler: (html, ctx) =>
        ctx.server ? html : html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`),
    },
  };
}

export default defineConfig({
  plugins: [react(), inhaltsrichtlinie()],
  base: "./",
  // pdf-lib mit fontkit wird nur beim PDF-Download nachgeladen.
  build: { chunkSizeWarningLimit: 1200 },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
