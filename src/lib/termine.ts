import { tx, type Text } from "../i18n/sprache";
import { lebenslagen } from "../inhalte/lebenslagen";
import type { Daten } from "./daten";
import { lies, plusMonate, tageBis } from "./datum";
import { erstelleFahrplan } from "./fahrplan";

export type TerminArt = "frist" | "ab" | "etwa" | "eigener" | "ablauf";

export interface AppTermin {
  id: string;
  titel: Text;
  datum: Date;
  uhrzeit?: string;
  art: TerminArt;
  notiz?: Text;
  quelle?: { pfad: string; text: Text };
}

/**
 * Sammelt alle Daten aus Fahrplänen, Unterlagen-Ordner und eigenen Terminen.
 * Erledigte Schritte und Fristen, die mehr als 30 Tage vorbei sind, fallen weg.
 */
export function sammleTermine(daten: Daten, heute: Date): AppTermin[] {
  const liste: AppTermin[] = [];
  for (const lage of lebenslagen) {
    const stand = daten.lagen[lage.id];
    if (!stand) continue;
    for (const s of erstelleFahrplan(lage, stand.antworten, stand.erledigt, heute)) {
      if (s.status === "erledigt" || !s.frist) continue;
      const quelle = { pfad: `/lage/${lage.id}`, text: lage.titel };
      if (s.frist.bis) liste.push({ id: `${lage.id}-${s.schritt.id}`, titel: s.schritt.titel, datum: s.frist.bis, art: "frist", quelle });
      else if (s.frist.ab) liste.push({ id: `${lage.id}-${s.schritt.id}`, titel: s.schritt.titel, datum: s.frist.ab, art: "ab", quelle });
      else if (s.frist.etwa) liste.push({ id: `${lage.id}-${s.schritt.id}`, titel: s.schritt.titel, datum: s.frist.etwa, art: "etwa", quelle });
    }
  }
  for (const d of daten.dokumente) {
    const ablauf = lies(d.gueltigBis);
    if (!ablauf) continue;
    // Erinnerung zwei Monate vorher, damit Zeit für einen Termin bleibt.
    liste.push({
      id: `dok-${d.id}`,
      titel: { de: `${d.titel} läuft ab`, en: `${d.titel} expires`, ru: `Срок действия: ${d.titel}` },
      datum: ablauf,
      art: "ablauf",
      notiz: tx(
        `Neu beantragen am besten ab ${plusMonate(ablauf, -2).toLocaleDateString("de-DE")}.`,
        `Best to renew from ${plusMonate(ablauf, -2).toLocaleDateString("en-GB")}.`,
        `Лучше продлить с ${plusMonate(ablauf, -2).toLocaleDateString("ru-RU")}.`,
      ),
      quelle: { pfad: "/mein/unterlagen", text: tx("Unterlagen-Ordner", "Document folder", "Папка документов") },
    });
  }
  for (const t of daten.termine) {
    const datum = lies(t.datum);
    if (!datum) continue;
    liste.push({ id: `eigen-${t.id}`, titel: t.titel, datum, uhrzeit: t.uhrzeit, art: "eigener", notiz: t.notiz });
  }
  return liste.filter((t) => tageBis(t.datum, heute) >= -30).sort((a, b) => a.datum.getTime() - b.datum.getTime());
}
