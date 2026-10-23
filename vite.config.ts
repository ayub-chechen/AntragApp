import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  // pdf-lib mit fontkit wird nur beim PDF-Download nachgeladen.
  build: { chunkSizeWarningLimit: 1200 },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
