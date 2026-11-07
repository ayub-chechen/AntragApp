import { useEffect, useRef, useState, type ReactNode } from "react";
import { ui } from "../i18n/ui";
import { useSprache, type Tx } from "../i18n/sprache";
import type { Antworten, Frage } from "../inhalte/typen";
import { lies } from "../lib/datum";
import { sichtbareFragen } from "../lib/fahrplan";
import { normalisiereDatum } from "../lib/validierung";
import { FrageFeld } from "./FrageFeld";

interface Gruppe {
  titel?: Tx;
  fragen: Frage[];
}

interface Props {
  gruppen: Gruppe[];
  start: Antworten;
  knopf: Tx;
  onFertig: (a: Antworten) => void;
  zusatz?: ReactNode;
}

export function pruefeAntworten(fragen: Frage[], a: Antworten): Record<string, Tx> {
  const fehler: Record<string, Tx> = {};
  for (const f of sichtbareFragen(fragen, a)) {
    const w = (a[f.id] ?? "").trim();
    if (!w) {
      if (f.pflicht) fehler[f.id] = ui.pflichtFehler;
      continue;
    }
    if (f.typ === "datum" && !lies(w)) fehler[f.id] = ui.datumFehler;
    if (f.typ === "zahl" && !/^\d[\d.,\s]*$/.test(w)) fehler[f.id] = ui.zahlFehler;
  }
  return fehler;
}

export function FragenFormular({ gruppen, start, knopf, onFertig, zusatz }: Props) {
  const { t } = useSprache();
  const [werte, setWerte] = useState<Antworten>(start);
  const [fehler, setFehler] = useState<Record<string, Tx>>({});
  const [versuch, setVersuch] = useState(0);
  const liste = useRef<HTMLDivElement>(null);
  const alle = gruppen.flatMap((g) => g.fragen);

  useEffect(() => {
    if (versuch) liste.current?.focus();
  }, [versuch]);

  const setze = (id: string, wert: string) => {
    setWerte((w) => ({ ...w, [id]: wert }));
    if (fehler[id]) setFehler(({ [id]: _, ...rest }) => rest);
  };

  const absenden = (e: React.FormEvent) => {
    e.preventDefault();
    const bereinigt: Antworten = {};
    const sichtbar = new Set(sichtbareFragen(alle, werte).map((f) => f.id));
    for (const f of alle) {
      const w = werte[f.id];
      if (!w || !sichtbar.has(f.id)) continue;
      bereinigt[f.id] = f.typ === "datum" ? normalisiereDatum(w) : w.trim();
    }
    const neu = pruefeAntworten(alle, bereinigt);
    setWerte(bereinigt);
    setFehler(neu);
    if (Object.keys(neu).length) {
      setVersuch((v) => v + 1);
      return;
    }
    onFertig(bereinigt);
  };

  const offene = alle.filter((f) => fehler[f.id]);

  return (
    <form noValidate onSubmit={absenden} className="fragen">
      {offene.length > 0 && (
        <div className="fehlerliste" role="alert" tabIndex={-1} ref={liste} aria-labelledby="fragen-fehler">
          <h3 id="fragen-fehler">{t(ui.fehlerTitel(offene.length))}</h3>
          <ul>
            {offene.map((f) => (
              <li key={f.id}>
                <a
                  href={`#frage-${f.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(`frage-${f.id}`)?.focus();
                  }}
                >
                  {t(f.frage)}: {t(fehler[f.id])}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {gruppen.map((g, i) => {
        const sichtbar = sichtbareFragen(g.fragen, werte);
        if (!sichtbar.length) return null;
        const felder = sichtbar.map((f) => (
          <FrageFeld key={f.id} frage={f} wert={werte[f.id] ?? ""} fehler={fehler[f.id] ? t(fehler[f.id]) : undefined} onChange={(v) => setze(f.id, v)} />
        ));
        return g.titel ? (
          <section key={i} className="fragen-gruppe" aria-labelledby={`gruppe-${i}`}>
            <h2 id={`gruppe-${i}`}>{t(g.titel)}</h2>
            {felder}
          </section>
        ) : (
          <div key={i}>{felder}</div>
        );
      })}
      {zusatz}
      <div className="aktionen">
        <button type="submit" className="knopf">
          {t(knopf)}
        </button>
      </div>
    </form>
  );
}
