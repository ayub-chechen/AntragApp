import { describe, expect, it } from "vitest";
import { findeLage, lebenslagen } from "../inhalte/lebenslagen";
import { alsText } from "./datum";
import { erstelleFahrplan, fehlendeAntworten } from "./fahrplan";

const heute = new Date(2026, 10, 7);
const plan = (id: string, a: Record<string, string>, erledigt: string[] = []) => erstelleFahrplan(findeLage(id)!, a, erledigt, heute);
const ids = (p: ReturnType<typeof plan>) => p.map((s) => s.schritt.id);
const bis = (p: ReturnType<typeof plan>, id: string) => {
  const f = p.find((s) => s.schritt.id === id)?.frist?.bis;
  return f ? alsText(f) : undefined;
};

describe("Fahrplan", () => {
  it("Umzug: Anmeldung 14 Tage nach Einzug, Ausland bekommt Aufenthalt und Steuer-ID", () => {
    const p = plan("neu", { einzug: "01.12.2026", herkunft: "ausland", staat: "andere", leistungen: "nein" });
    expect(bis(p, "anmelden")).toBe("15.12.2026");
    expect(ids(p)).toContain("aufenthalt");
    expect(ids(p)).toContain("steuerid");
    expect(ids(p)).not.toContain("aemter");
    expect(ids(p)).not.toContain("zusicherung");
    expect(ids(p).indexOf("wgb")).toBeLessThan(ids(p).indexOf("anmelden"));
  });

  it("Umzug innerhalb Berlins mit Leistungen: erst Zusicherung, dann Ämter informieren", () => {
    const p = plan("neu", { einzug: "01.12.2026", herkunft: "berlin", leistungen: "ja", kinder: "ja" });
    expect(ids(p)[0]).toBe("zusicherung");
    expect(ids(p)).toContain("aemter");
    expect(ids(p)).toContain("kita");
    expect(ids(p)).not.toContain("steuerid");
  });

  it("Baby: Fristen für Elterngeld, Kindergeld, Geburtsanzeige und Kita-Gutschein", () => {
    const p = plan("baby", { geburt: "15.01.2027", verheiratet: "nein", mutter_job: "ja", partner_job: "ja", kita: "ja" });
    expect(bis(p, "vaterschaft")).toBe("15.01.2027");
    expect(bis(p, "elternzeit")).toBe("27.11.2026"); // 7 Wochen vor der Geburt
    expect(bis(p, "geburtsanzeige")).toBe("22.01.2027");
    expect(bis(p, "elterngeld")).toBe("15.04.2027");
    expect(bis(p, "kindergeld")).toBe("15.07.2027");
    expect(bis(p, "kita")).toBe("15.11.2027");
    const mutterschutz = p.find((s) => s.schritt.id === "mutterschaftsgeld")!;
    expect(alsText(mutterschutz.frist!.ab!)).toBe("27.11.2026");
  });

  it("Baby: Elternzeit nur der Mutter ist 8 Wochen nach der Geburt minus 7 Wochen fällig", () => {
    const p = plan("baby", { geburt: "15.01.2027", mutter_job: "ja", partner_job: "nein" });
    expect(bis(p, "elternzeit")).toBe("22.01.2027");
    expect(ids(p)).not.toContain("vaterschaft");
  });

  it("Job: arbeitsuchend 3 Monate vorher oder 3 Tage nach Kenntnis", () => {
    expect(bis(plan("job", { kenntnis: "01.08.2026", ende: "31.12.2026" }), "arbeitsuchend")).toBe("30.09.2026");
    const kurz = plan("job", { kenntnis: "02.11.2026", ende: "30.11.2026", kuendigung: "ja" });
    expect(bis(kurz, "arbeitsuchend")).toBe("05.11.2026");
    expect(bis(kurz, "klage")).toBe("23.11.2026");
    expect(kurz.find((s) => s.schritt.id === "arbeitsuchend")!.status).toBe("ueberfaellig");
    expect(kurz.find((s) => s.schritt.id === "klage")!.status).toBe("offen");
  });

  it("Studium: BAföG bis Monatsende des Beginns, Folgeantrag nach 10 Monaten", () => {
    const p = plan("studium", { beginn: "15.04.2027", art: "studium", eltern: "nein", unter25: "ja" });
    expect(bis(p, "bafoeg")).toBe("30.04.2027");
    expect(bis(p, "folgeantrag")).toBe("15.02.2028");
    expect(ids(p)).toContain("rundfunk");
    expect(ids(p)).not.toContain("bab");
  });

  it("markiert erledigte Schritte", () => {
    const p = plan("geld", { kinder: "ja", arbeit: "ja" }, ["wohngeld"]);
    expect(p.find((s) => s.schritt.id === "wohngeld")!.status).toBe("erledigt");
    expect(bis(p, "kinderzuschlag")).toBe("30.11.2026");
  });

  it("prüft Pflichtfragen und Datumsformat", () => {
    const lage = findeLage("baby")!;
    expect(fehlendeAntworten(lage.fragen, {})).toEqual(["geburt"]);
    expect(fehlendeAntworten(lage.fragen, { geburt: "31.02.2027" })).toEqual(["geburt"]);
    expect(fehlendeAntworten(lage.fragen, { geburt: "15.01.2027" })).toEqual([]);
  });

  it("jede Lebenslage liefert ohne Fehler einen Fahrplan, auch mit leeren Antworten", () => {
    for (const l of lebenslagen) expect(() => erstelleFahrplan(l, {}, [], heute)).not.toThrow();
  });
});
