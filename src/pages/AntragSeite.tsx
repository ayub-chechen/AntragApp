import { useEffect, useRef, useState } from "react";
import type { Antrag, Werte } from "../antraege/typen";
import { FeldEingabe } from "../components/FeldEingabe";
import { Linie } from "../components/Linie";
import { Uebergabe } from "../components/Uebergabe";
import { zusammenfassung } from "../lib/anzeige";
import { link } from "../lib/router";
import { fristHinweis, istSichtbar, pruefeFeld, pruefeSchritt } from "../lib/validierung";

export function AntragSeite({ antrag }: { antrag: Antrag }) {
  // Angaben nur im Arbeitsspeicher, siehe docs/datenschutz-check.md
  const [werte, setWerte] = useState<Werte>({});
  const [fehler, setFehler] = useState<Record<string, string>>({});
  const [schritt, setSchritt] = useState(0);
  const [pdfStatus, setPdfStatus] = useState<"bereit" | "laeuft" | "fertig" | "fehler">("bereit");
  const [gestartet, setGestartet] = useState(false);
  const zusammenfassungRef = useRef<HTMLDivElement>(null);
  const titelRef = useRef<HTMLHeadingElement>(null);
  const fehlerVersuch = useRef(0);
  const [versuch, setVersuch] = useState(0);

  const aktuell = antrag.schritte[schritt];
  const istPruefen = aktuell.id === "pruefen";
  const felder = antrag.felder.filter((f) => f.schritt === aktuell.id && istSichtbar(f, werte));
  const offeneFehler = felder.filter((f) => fehler[f.name]);

  useEffect(() => {
    if (gestartet) titelRef.current?.focus();
  }, [schritt, gestartet]);

  useEffect(() => {
    if (versuch > 0) zusammenfassungRef.current?.focus();
  }, [versuch]);

  const setze = (name: string, wert: string) => {
    setWerte((w) => ({ ...w, [name]: wert }));
    if (fehler[name]) {
      const feld = antrag.felder.find((f) => f.name === name)!;
      setFehler((f) => {
        const neu = { ...f };
        const meldung = pruefeFeld(feld, wert);
        if (meldung) neu[name] = meldung;
        else delete neu[name];
        return neu;
      });
    }
  };

  const pruefeBeimVerlassen = (name: string) => {
    const feld = antrag.felder.find((f) => f.name === name)!;
    if (!werte[name]) return;
    const meldung = pruefeFeld(feld, werte[name]);
    setFehler((f) => {
      const neu = { ...f };
      if (meldung) neu[name] = meldung;
      else delete neu[name];
      return neu;
    });
  };

  const weiter = (e: React.FormEvent) => {
    e.preventDefault();
    const neu = pruefeSchritt(felder, werte);
    setFehler(neu);
    if (Object.keys(neu).length > 0) {
      fehlerVersuch.current += 1;
      setVersuch(fehlerVersuch.current);
      return;
    }
    setGestartet(true);
    setSchritt((s) => s + 1);
    window.scrollTo(0, 0);
  };

  const wechsle = (i: number) => {
    setGestartet(true);
    setFehler({});
    setSchritt(i);
  };

  const loeschen = () => {
    setWerte({});
    setFehler({});
    setPdfStatus("bereit");
    setGestartet(true);
    setSchritt(0);
  };

  const herunterladen = async () => {
    setPdfStatus("laeuft");
    try {
      // PDF-Bibliothek und Schriften erst laden, wenn sie gebraucht werden.
      const [{ erzeugePdf }, { ladeSchriften }] = await Promise.all([import("../lib/pdf"), import("../lib/schriften")]);
      const bytes = await erzeugePdf(antrag, werte, await ladeSchriften());
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `ausfuellhilfe-${antrag.id}.pdf`;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setPdfStatus("fertig");
    } catch {
      setPdfStatus("fehler");
    }
  };

  const hinweis = (name: string) => (name === "einzugsdatum" && !fehler[name] ? fristHinweis(werte[name] ?? "") : null);

  return (
    <section className="seite antrag">
      <p className="zurueck">
        <a href={link("/")}>Alle Lebenslagen</a>
      </p>
      <h1 tabIndex={-1}>{antrag.titel}</h1>
      <p className="einleitung">{antrag.kurz}</p>
      {!antrag.stand_geprueft && (
        <p className="hinweis">
          Die Angaben in dieser Ausfüllhilfe sind noch nicht mit dem aktuellen amtlichen Formular
          abgeglichen. Maßgeblich ist{" "}
          <a href={antrag.quelle_url} target="_blank" rel="noopener noreferrer">
            die Seite auf service.berlin.de<span className="sr"> (öffnet in neuem Tab)</span>
          </a>
          .
        </p>
      )}

      <Linie schritte={antrag.schritte} aktuell={schritt} onWechsel={wechsle} />

      <div className="schritt">
        <h2 ref={titelRef} tabIndex={-1}>
          {aktuell.titel}
        </h2>
        {aktuell.beschreibung && <p className="schritt-text">{aktuell.beschreibung}</p>}

        {!istPruefen ? (
          <form noValidate onSubmit={weiter}>
            {offeneFehler.length > 0 && (
              <div className="fehlerliste" role="alert" tabIndex={-1} ref={zusammenfassungRef} aria-labelledby="fehler-titel">
                <h3 id="fehler-titel">Bitte prüfen Sie {offeneFehler.length === 1 ? "eine Angabe" : `${offeneFehler.length} Angaben`}</h3>
                <ul>
                  {offeneFehler.map((f) => (
                    <li key={f.name}>
                      <a
                        href={`#feld-${f.name}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(`feld-${f.name}`)?.focus();
                        }}
                      >
                        {fehler[f.name]}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {felder.map((f) => (
              <FeldEingabe
                key={f.name}
                feld={f}
                wert={werte[f.name] ?? ""}
                fehler={fehler[f.name]}
                hinweis={hinweis(f.name)}
                onChange={(v) => setze(f.name, v)}
                onBlur={() => pruefeBeimVerlassen(f.name)}
              />
            ))}
            <div className="aktionen">
              {schritt > 0 && (
                <button type="button" className="knopf-zweit" onClick={() => wechsle(schritt - 1)}>
                  Zurück
                </button>
              )}
              <button type="submit" className="knopf">
                Weiter
              </button>
            </div>
          </form>
        ) : (
          <>
            {zusammenfassung(antrag, werte).map((a) => (
              <div key={a.titel} className="pruef-block">
                <h3>{a.titel}</h3>
                <dl>
                  {a.zeilen.map((z) => (
                    <div key={z.label}>
                      <dt>{z.label}</dt>
                      <dd>{z.wert}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
            <div className="aktionen">
              <button type="button" className="knopf-zweit" onClick={() => wechsle(schritt - 1)}>
                Zurück
              </button>
              <button type="button" className="knopf" onClick={herunterladen} disabled={pdfStatus === "laeuft"}>
                {pdfStatus === "laeuft" ? "PDF wird erstellt …" : "PDF herunterladen"}
              </button>
            </div>
            <p role="status" className="pdf-status">
              {pdfStatus === "fertig" && "PDF heruntergeladen. Sie finden es in Ihrem Download-Ordner."}
              {pdfStatus === "fehler" && "Das PDF konnte nicht erstellt werden. Bitte laden Sie die Seite neu und versuchen Sie es noch einmal."}
            </p>
            <Uebergabe antrag={antrag} />
          </>
        )}
      </div>

      <div className="loeschen">
        <p>Ihre Angaben bleiben nur in diesem Fenster und werden nirgends gespeichert.</p>
        <button type="button" className="knopf-leise" onClick={loeschen}>
          Alle Angaben löschen
        </button>
      </div>
    </section>
  );
}
