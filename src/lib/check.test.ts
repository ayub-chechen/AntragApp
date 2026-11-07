import { describe, expect, it } from "vitest";
import { leistungen } from "../inhalte/leistungen";
import { pruefeAnsprueche } from "./check";

const ids = (a: Record<string, string>) => pruefeAnsprueche(a).map((e) => `${e.id}:${e.stufe}`);

describe("Anspruchs-Check", () => {
  it("Familie mit zwei kleinen Kindern und mittlerem Einkommen: Kindergeld, Kinderzuschlag, Wohngeld", () => {
    const e = pruefeAnsprueche({ alter: "35", partner: "ja", kinder_alter: "2, 5", taetigkeit: "angestellt", einkommen: "2.600", miete: "1100" });
    const kg = e.find((x) => x.id === "kindergeld")!;
    expect(kg.stufe).toBe("wahrscheinlich");
    expect(kg.betrag).toEqual({ art: "etwa", wert: 518 });
    expect(e.map((x) => x.id)).toEqual(expect.arrayContaining(["kinderzuschlag", "wohngeld", "kita"]));
    // Knapp über dem Bedarf: höchstens „prüfen“, Kinderzuschlag und Wohngeld gehen vor.
    expect(e.find((x) => x.id === "grundsicherungsgeld")?.stufe).not.toBe("wahrscheinlich");
  });

  it("Alleinstehend ohne Einkommen: Grundsicherungsgeld wahrscheinlich, Rundfunk-Befreiung", () => {
    const r = ids({ alter: "40", partner: "nein", taetigkeit: "arbeitslos", versichert: "nein", einkommen: "0", miete: "600" });
    expect(r).toContain("grundsicherungsgeld:wahrscheinlich");
    expect(r).toContain("rundfunk:pruefen");
    expect(r.some((x) => x.startsWith("alg"))).toBe(false);
  });

  it("Arbeitslos mit 12 Monaten Versicherung: Arbeitslosengeld wahrscheinlich", () => {
    expect(ids({ alter: "45", partner: "ja", taetigkeit: "arbeitslos", versichert: "ja", einkommen: "2400", miete: "900" })).toContain("alg:wahrscheinlich");
  });

  it("Alleinerziehend: Unterhaltsvorschuss nach Alter der Kinder", () => {
    const e = pruefeAnsprueche({ alter: "30", partner: "nein", kinder_alter: "3, 8, 13", taetigkeit: "angestellt", einkommen: "1900", miete: "950" });
    expect(e.find((x) => x.id === "unterhaltsvorschuss")!.betrag).toEqual({ art: "bis", wert: 227 + 299 + 394 });
  });

  it("Rentnerin mit kleiner Rente: Grundsicherung im Alter statt Jobcenter", () => {
    const r = ids({ alter: "72", partner: "nein", taetigkeit: "rente", einkommen: "780", miete: "520" });
    expect(r).toContain("grundsicherung_alter:wahrscheinlich");
    expect(r.some((x) => x.startsWith("grundsicherungsgeld"))).toBe(false);
  });

  it("Studium: BAföG prüfen, kein Grundsicherungsgeld", () => {
    const r = ids({ alter: "21", partner: "nein", taetigkeit: "ausbildung", einkommen: "450", miete: "480" });
    expect(r).toContain("bafoeg:pruefen");
    expect(r.some((x) => x.startsWith("grundsicherungsgeld"))).toBe(false);
  });

  it("Schwanger und angestellt: Elterngeld und Mutterschaftsgeld", () => {
    const r = ids({ alter: "31", partner: "ja", schwanger: "ja", taetigkeit: "angestellt", einkommen: "4200", miete: "1300" });
    expect(r).toContain("elterngeld:wahrscheinlich");
    expect(r).toContain("mutterschaftsgeld:wahrscheinlich");
  });

  it("zeigt nichts doppelt, was man schon bekommt", () => {
    const r = ids({ alter: "35", partner: "ja", kinder_alter: "4", taetigkeit: "angestellt", einkommen: "3000", miete: "1000", bekommt: "kindergeld,wohngeld" });
    expect(r.some((x) => x.startsWith("kindergeld"))).toBe(false);
    expect(r.some((x) => x.startsWith("wohngeld"))).toBe(false);
  });

  it("gutes Einkommen ohne Kinder: keine Geldleistung", () => {
    expect(pruefeAnsprueche({ alter: "40", partner: "nein", taetigkeit: "angestellt", einkommen: "3500", miete: "900" })).toEqual([]);
  });

  it("jedes Ergebnis gehört zu einer beschriebenen Leistung", () => {
    const alle = pruefeAnsprueche({ alter: "30", partner: "nein", kinder_alter: "0, 4", schwanger: "ja", taetigkeit: "angestellt", einkommen: "1300", miete: "800", pflege: "ja", behinderung: "ja" });
    for (const e of alle) expect(leistungen.some((l) => l.id === e.id)).toBe(true);
  });
});
