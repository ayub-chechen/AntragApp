import { describe, expect, it } from "vitest";
import { findeAntrag } from "../antraege";
import {
  istBerlinerPlz,
  istIban,
  istPlz,
  istSteuerId,
  istTelefon,
  parseDatum,
  pruefeFeld,
  pruefeSchritt,
} from "./validierung";
import { testWerte } from "./testdaten";

const antrag = findeAntrag("wohnsitzanmeldung")!;

describe("Formate", () => {
  it("prüft Postleitzahlen", () => {
    expect(istPlz("10115")).toBe(true);
    expect(istPlz("1011")).toBe(false);
    expect(istBerlinerPlz("14199")).toBe(true);
    expect(istBerlinerPlz("10114")).toBe(false);
    expect(istBerlinerPlz("20095")).toBe(false);
  });

  it("prüft Datum TT.MM.JJJJ", () => {
    expect(parseDatum("29.02.2024")).not.toBeNull();
    expect(parseDatum("29.02.2025")).toBeNull();
    expect(parseDatum("2024-02-01")).toBeNull();
    expect(parseDatum("1.2.2024")).toBeNull();
  });

  it("prüft IBAN mit Prüfziffer", () => {
    expect(istIban("DE89 3704 0044 0532 0130 00")).toBe(true);
    expect(istIban("DE88 3704 0044 0532 0130 00")).toBe(false);
    expect(istIban("DE89 3704 0044 0532 0130")).toBe(false);
  });

  it("prüft Steuer-ID", () => {
    expect(istSteuerId("86095742719")).toBe(true);
    expect(istSteuerId("86095742718")).toBe(false);
    expect(istSteuerId("06095742719")).toBe(false);
    expect(istSteuerId("1234")).toBe(false);
  });

  it("prüft Telefonnummern", () => {
    expect(istTelefon("030 1234567")).toBe(true);
    expect(istTelefon("+49 (30) 123-4567")).toBe(true);
    expect(istTelefon("12")).toBe(false);
    expect(istTelefon("030 abc")).toBe(false);
  });
});

describe("Wohnsitzanmeldung", () => {
  it("akzeptiert vollständige Testdaten", () => {
    expect(pruefeSchritt(antrag.felder, testWerte)).toEqual({});
  });

  const sichtbarePflicht = antrag.felder.filter((f) => f.pflicht && (!f.wenn || testWerte[f.wenn.feld] === f.wenn.wert));
  it.each(sichtbarePflicht.map((f) => [f.name, f] as const))("meldet fehlendes Pflichtfeld %s", (name) => {
    const fehler = pruefeSchritt(antrag.felder, { ...testWerte, [name]: "" });
    expect(Object.keys(fehler)).toEqual([name]);
  });

  it("verlangt Staat statt PLZ bei Wohnung im Ausland", () => {
    const werte = { ...testWerte, bisher_ausland: "ja", bisher_plz: "" };
    expect(Object.keys(pruefeSchritt(antrag.felder, werte))).toEqual(["bisher_staat"]);
  });

  it("lehnt Nicht-Berliner PLZ für die neue Wohnung ab", () => {
    const feld = antrag.felder.find((f) => f.name === "neu_plz")!;
    expect(pruefeFeld(feld, "20095")).toMatch(/keine Berliner/);
  });

  it("lehnt unbekannte Auswahlwerte ab", () => {
    const feld = antrag.felder.find((f) => f.name === "familienstand")!;
    expect(pruefeFeld(feld, "kompliziert")).not.toBeNull();
  });

  it("lehnt Geburtsdatum in der Zukunft ab", () => {
    const feld = antrag.felder.find((f) => f.name === "geburtsdatum")!;
    expect(pruefeFeld(feld, "01.01.2999")).toMatch(/Zukunft/);
  });

  it("hat eindeutige Feldnamen und gültige Schritte", () => {
    const namen = antrag.felder.map((f) => f.name);
    expect(new Set(namen).size).toBe(namen.length);
    const schritte = new Set(antrag.schritte.map((s) => s.id));
    for (const f of antrag.felder) expect(schritte.has(f.schritt)).toBe(true);
  });
});
