import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { briefAlsText, erzeugeBriefe, type Brief } from "./briefPdf";

const require = createRequire(import.meta.url);
const schriften = {
  normal: readFileSync(require.resolve("dejavu-fonts-ttf/ttf/DejaVuSans.ttf")),
  fett: readFileSync(require.resolve("dejavu-fonts-ttf/ttf/DejaVuSans-Bold.ttf")),
};

// Erfundene Person
const brief: Brief = {
  absender: ["Jörg Müller-Łukasiewicz", "Musterstraße 12a", "10115 Berlin"],
  empfaenger: ["Familienkasse", "Postfach 1234", "10000 Berlin"],
  ortDatum: "Berlin, 07.11.2026",
  betreff: "Mitteilung meiner neuen Anschrift – Kindergeldnummer: 123FK456789",
  text: "ich bin am 01.11.2026 umgezogen.\n\nBisherige Anschrift:\nAlte Straße 1\n12345 Berlin",
  name: "Jörg Müller-Łukasiewicz",
  anlagen: ["Kopie der Meldebescheinigung"],
};

describe("Briefe", () => {
  it("erzeugt eine Seite pro Brief", async () => {
    const doc = await PDFDocument.load(await erzeugeBriefe([brief, { ...brief, empfaenger: ["Jobcenter"] }], schriften, "Umzug"));
    expect(doc.getPageCount()).toBe(2);
    expect(doc.getTitle()).toBe("Umzug");
  });

  it("bricht sehr lange Briefe auf weitere Seiten um", async () => {
    const doc = await PDFDocument.load(await erzeugeBriefe([{ ...brief, text: "Lange Begründung. ".repeat(600) }], schriften));
    expect(doc.getPageCount()).toBeGreaterThan(1);
  });

  it("liefert den Brief auch als Text", () => {
    const text = briefAlsText(brief);
    expect(text).toContain("Sehr geehrte Damen und Herren,");
    expect(text).toContain("Mit freundlichen Grüßen");
    expect(text).toContain("Anlagen: Kopie der Meldebescheinigung");
  });
});
