import { describe, expect, it } from "vitest";
import { entschluessele, istTresor, neuesSalz, salzVon, schluesselAus, verschluessele } from "./tresor";

describe("Tresor", () => {
  it("verschlüsselt und entschlüsselt mit der richtigen PIN", async () => {
    const salz = neuesSalz();
    const key = await schluesselAus("geheim123", salz, 1000);
    const daten = { profil: { "person.familienname": "Müller-Łukasiewicz" }, kinder: [] };
    const t = await verschluessele(daten, key, salz);
    expect(istTresor(t)).toBe(true);
    expect(t.inhalt).not.toContain("Müller");
    const zurueck = await entschluessele(t, await schluesselAus("geheim123", salzVon(t), 1000));
    expect(zurueck).toEqual(daten);
  });

  it("lehnt eine falsche PIN ab", async () => {
    const salz = neuesSalz();
    const t = await verschluessele({ a: 1 }, await schluesselAus("richtig1", salz, 1000), salz);
    await expect(entschluessele(t, await schluesselAus("falsch12", salz, 1000))).rejects.toThrow();
  });

  it("nutzt jedes Mal einen neuen Startwert", async () => {
    const salz = neuesSalz();
    const key = await schluesselAus("pin-pin-pin", salz, 1000);
    const a = await verschluessele({ x: 1 }, key, salz);
    const b = await verschluessele({ x: 1 }, key, salz);
    expect(a.iv).not.toBe(b.iv);
    expect(a.inhalt).not.toBe(b.inhalt);
  });

  it("erkennt fremde Dateien", () => {
    expect(istTresor({ foo: 1 })).toBe(false);
    expect(istTresor(null)).toBe(false);
  });
});
