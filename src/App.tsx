import { useEffect, useRef } from "react";
import { findeAntrag } from "./antraege";
import { link, useHashPfad } from "./lib/router";
import { AntragSeite } from "./pages/AntragSeite";
import { Datenschutz } from "./pages/Datenschutz";
import { Start } from "./pages/Start";

export function App() {
  const pfad = useHashPfad();
  const main = useRef<HTMLElement>(null);
  const ersterAufruf = useRef(true);

  useEffect(() => {
    if (ersterAufruf.current) {
      ersterAufruf.current = false;
      return;
    }
    window.scrollTo(0, 0);
    main.current?.querySelector<HTMLElement>("h1")?.focus();
  }, [pfad]);

  let seite;
  const antragId = /^\/antrag\/([\w-]+)$/.exec(pfad)?.[1];
  if (pfad === "/") seite = <Start />;
  else if (pfad === "/datenschutz") seite = <Datenschutz />;
  else if (antragId && findeAntrag(antragId)) seite = <AntragSeite key={antragId} antrag={findeAntrag(antragId)!} />;
  else
    seite = (
      <section className="seite">
        <h1 tabIndex={-1}>Diese Seite gibt es nicht</h1>
        <p>
          <a href={link("/")}>Zur Startseite</a>
        </p>
      </section>
    );

  return (
    <>
      <a className="skip" href="#inhalt">
        Zum Inhalt springen
      </a>
      <header className="kopf">
        <a className="marke" href={link("/")}>
          <svg aria-hidden="true" viewBox="0 0 64 64" width="28" height="28">
            <rect width="64" height="64" rx="14" fill="currentColor" />
            <rect x="16" y="12" width="32" height="40" rx="3" fill="#fff" />
            <circle cx="44" cy="46" r="9" fill="#ffd400" />
          </svg>
          Antragshilfe Berlin
        </a>
      </header>
      <main id="inhalt" ref={main}>
        {seite}
      </main>
      <footer className="fuss">
        <p>
          Die Antragshilfe ist kein Angebot des Landes Berlin. Sie hilft beim Ausfüllen. Einreichen
          können Sie nur beim Amt oder auf service.berlin.de.
        </p>
        <p>
          <a href={link("/datenschutz")}>Datenschutz</a>
        </p>
      </footer>
    </>
  );
}
