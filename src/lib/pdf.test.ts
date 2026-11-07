import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { findeAntrag } from "../antraege";
import { erzeugePdf } from "./pdf";
import { testWerte } from "./testdaten";

const require = createRequire(import.meta.url);
const schriften = {
  normal: readFileSync(require.resolve("dejavu-fonts-ttf/ttf/DejaVuSans.ttf")),
  fett: readFileSync(require.resolve("dejavu-fonts-ttf/ttf/DejaVuSans-Bold.ttf")),
};

describe("PDF", () => {
  const antrag = findeAntrag("wohnsitzanmeldung")!;
  const datum = new Date("2026-10-23T10:00:00Z");

  it("erzeugt ein lesbares PDF mit Umlauten und Sonderzeichen", async () => {
    const bytes = await erzeugePdf(antrag, { ...testWerte, familienname: "Жуков-Łęcki" }, schriften, datum);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
    expect(doc.getTitle()).toBe("Ausfüllhilfe: Anmeldung einer Wohnung");
  });

  it("ist bei gleichen Eingaben stabil", async () => {
    const a = await erzeugePdf(antrag, testWerte, schriften, datum);
    const b = await erzeugePdf(antrag, testWerte, schriften, datum);
    expect(a.length).toBe(b.length);
  });

  it("bricht lange Angaben auf mehrere Seiten um", async () => {
    const lang = { ...testWerte, neu_zusatz: "Hinterhaus ".repeat(400) };
    const doc = await PDFDocument.load(await erzeugePdf(antrag, lang, schriften, datum));
    expect(doc.getPageCount()).toBeGreaterThan(1);
  });
});
