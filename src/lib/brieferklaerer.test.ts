import { describe, expect, it } from "vitest";
import { analysiere } from "./brieferklaerer";
import { alsText } from "./datum";

const MITWIRKUNG = `Jobcenter Berlin Mitte
Berlin, den 02.11.2026
BG-Nummer: 96301BG0012345

für die Bearbeitung Ihres Weiterbewilligungsantrags benötigen wir noch folgende Unterlagen.
Bitte reichen Sie die Unterlagen bis zum 20.11.2026 ein. Andernfalls können die Leistungen nach § 66 SGB I versagt werden.

Rechtsbehelfsbelehrung
Gegen diesen Bescheid kann innerhalb eines Monats nach Bekanntgabe Widerspruch erhoben werden.`;

describe("Brief-Erklärer", () => {
  const a = analysiere(MITWIRKUNG);

  it("erkennt Absender, Datum, Zeichen und Art", () => {
    expect(a.absender?.de).toBe("Jobcenter");
    expect(alsText(a.briefdatum!)).toBe("02.11.2026");
    expect(a.aktenzeichen).toBe("96301BG0012345");
    expect(a.arten.map((x) => x.id)).toContain("mitwirkung");
    expect(a.arten.map((x) => x.id)).not.toContain("ablehnung");
    expect(a.arten.map((x) => x.id)).not.toContain("bewilligung");
  });

  it("findet feste Fristen und rechnet die Widerspruchsfrist mit 4 Tagen Zugang", () => {
    const fristen = a.fristen.map((f) => `${f.art}:${alsText(f.datum)}`);
    expect(fristen).toContain("bis:20.11.2026");
    // Zugang 06.11., plus ein Monat = 06.12.2026 (Sonntag) → Montag 07.12.2026
    expect(fristen).toContain("widerspruch:07.12.2026");
    expect(a.fristen.find((f) => f.art === "widerspruch")!.verschoben).toBe(true);
  });

  it("späterer Zugang verschiebt die Frist", () => {
    const b = analysiere(MITWIRKUNG, { erhalten: new Date(2026, 10, 12) });
    expect(alsText(b.fristen.find((f) => f.art === "widerspruch")!.datum)).toBe("14.12.2026");
  });

  it("erklärt Fachwörter", () => {
    expect(a.woerter.map((w) => w.wort)).toEqual(expect.arrayContaining(["Widerspruch", "Rechtsbehelfsbelehrung", "Bekanntgabe", "Bescheid"]));
  });

  it("erkennt Einladungen mit Uhrzeit und relative Fristen", () => {
    const b = analysiere(
      "Familienkasse\nDatum: 05.11.2026\nEinladung: Bitte kommen Sie am Dienstag, den 17.11.2026 um 10:30 Uhr. Reichen Sie innerhalb von zwei Wochen die Geburtsurkunde ein.",
    );
    expect(b.arten.map((x) => x.id)).toContain("einladung");
    const termin = b.fristen.find((f) => f.art === "termin")!;
    expect(alsText(termin.datum)).toBe("17.11.2026");
    expect(termin.uhrzeit).toBe("10:30");
    // Zugang 09.11. + 14 Tage = 23.11.2026
    expect(b.fristen.some((f) => f.art === "relativ" && alsText(f.datum) === "23.11.2026")).toBe(true);
  });

  it("erkennt Ablehnung und Rückforderung mit Beträgen", () => {
    const b = analysiere("Aufhebungs- und Erstattungsbescheid. Ihr Antrag wird abgelehnt. Sie haben 312,40 € zu erstatten.");
    expect(b.arten.map((x) => x.id)).toEqual(expect.arrayContaining(["rueckforderung", "ablehnung"]));
    expect(b.betraege).toEqual(["312,40 €"]);
  });
});
