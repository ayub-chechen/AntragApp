import { describe, expect, it } from "vitest";
import { ui } from "../i18n/ui";
import { beratung, krise } from "./beratung";
import { briefArten, glossar, vorlagen } from "./briefe";
import { checkFragen } from "./checkFragen";
import { lebenslagen } from "./lebenslagen";
import { leistungen } from "./leistungen";
import { LINKS } from "./links";
import { neuigkeiten } from "./neuigkeiten";
import { dokArten, profilGruppen } from "./profil";

/** Sucht rekursiv alle Texte {de, en, ru} und meldet fehlende Übersetzungen. */
function fehlendeUebersetzungen(wert: unknown, pfad = "", ergebnis: string[] = [], gesehen = new Set<unknown>()): string[] {
  if (!wert || typeof wert !== "object" || gesehen.has(wert)) return ergebnis;
  gesehen.add(wert);
  const o = wert as Record<string, unknown>;
  if ("de" in o && "en" in o && "ru" in o) {
    for (const s of ["de", "en", "ru"]) if (typeof o[s] !== "string" || !(o[s] as string).trim()) ergebnis.push(`${pfad}.${s}`);
    if (typeof o.ru === "string" && o.ru.trim() && !/[а-яё]/i.test(o.ru) && !/^[\wÄÖÜäöüß\s()–-]+$/.test(o.ru)) ergebnis.push(`${pfad}.ru (kein Kyrillisch)`);
    return ergebnis;
  }
  for (const [k, v] of Object.entries(o)) fehlendeUebersetzungen(v, `${pfad}.${k}`, ergebnis, gesehen);
  return ergebnis;
}

describe("Inhalte", () => {
  it("sind vollständig in Deutsch, Englisch und Russisch", () => {
    const { formularDeutsch: _, ...rest } = ui;
    const alles = { rest, beratung, krise, briefArten, glossar, vorlagen, checkFragen, lebenslagen, leistungen, neuigkeiten, dokArten, profilGruppen };
    expect(fehlendeUebersetzungen(alles)).toEqual([]);
  });

  it("verlinken nur auf https-Seiten", () => {
    for (const url of Object.values(LINKS)) expect(url).toMatch(/^https:\/\/[\w.-]+\.\w+/);
  });

  it("haben eindeutige IDs", () => {
    expect(new Set(lebenslagen.map((l) => l.id)).size).toBe(lebenslagen.length);
    for (const l of lebenslagen) {
      expect(new Set(l.schritte.map((s) => s.id)).size).toBe(l.schritte.length);
      expect(new Set(l.fragen.map((f) => f.id)).size).toBe(l.fragen.length);
    }
    expect(new Set(leistungen.map((l) => l.id)).size).toBe(leistungen.length);
  });

  it("Neuigkeiten sind nach Datum absteigend sortiert", () => {
    const daten = neuigkeiten.map((n) => n.ab);
    expect([...daten].sort().reverse()).toEqual(daten);
  });
});
