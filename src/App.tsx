import { useEffect, useRef } from "react";
import { findeAntrag } from "./antraege";
import { Fuss, Kopf, Navigation } from "./components/Rahmen";
import { ui } from "./i18n/ui";
import { useSprache } from "./i18n/sprache";
import { findeLage } from "./inhalte/lebenslagen";
import { link, useHashPfad } from "./lib/router";
import { Anleitung } from "./pages/Anleitung";
import { AntragSeite } from "./pages/AntragSeite";
import { BriefSeite } from "./pages/BriefSeite";
import { CheckSeite } from "./pages/CheckSeite";
import { Datenschutz } from "./pages/Datenschutz";
import { Hilfe } from "./pages/Hilfe";
import { LageSeite } from "./pages/LageSeite";
import { Mehr } from "./pages/Mehr";
import { MeinBereich } from "./pages/MeinBereich";
import { Neuigkeiten } from "./pages/Neuigkeiten";
import { Organisationen } from "./pages/Organisationen";
import { Start } from "./pages/Start";
import { TermineSeite } from "./pages/TermineSeite";
import { UmzugMelden } from "./pages/UmzugMelden";

function Seite({ pfad }: { pfad: string }) {
  const { t } = useSprache();
  const antragId = /^\/antrag\/([\w-]+)$/.exec(pfad)?.[1];
  const lageId = /^\/lage\/([\w-]+)$/.exec(pfad)?.[1];
  const mein = /^\/mein(?:\/(\w+))?$/.exec(pfad);

  if (pfad === "/") return <Start />;
  if (lageId && findeLage(lageId)) return <LageSeite key={lageId} lage={findeLage(lageId)!} />;
  if (antragId && findeAntrag(antragId)) return <AntragSeite key={antragId} antrag={findeAntrag(antragId)!} />;
  if (pfad === "/check") return <CheckSeite />;
  if (pfad === "/termine") return <TermineSeite />;
  if (mein) return <MeinBereich bereich={mein[1] ?? "profil"} />;
  if (pfad === "/brief") return <BriefSeite />;
  if (pfad === "/umzug-melden") return <UmzugMelden />;
  if (pfad === "/hilfe") return <Hilfe />;
  if (pfad === "/neuigkeiten") return <Neuigkeiten />;
  if (pfad === "/anleitung") return <Anleitung />;
  if (pfad === "/organisationen") return <Organisationen />;
  if (pfad === "/mehr") return <Mehr />;
  if (pfad === "/datenschutz") return <Datenschutz />;
  return (
    <section className="seite">
      <h1 tabIndex={-1}>{t({ de: "Diese Seite gibt es nicht", en: "This page does not exist", ru: "Такой страницы нет" })}</h1>
      <p>
        <a href={link("/")}>{t(ui.navStart)}</a>
      </p>
    </section>
  );
}

export function App() {
  const pfad = useHashPfad();
  const { t } = useSprache();
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

  return (
    <>
      <a className="skip" href="#inhalt">
        {t(ui.zumInhalt)}
      </a>
      <Kopf />
      <Navigation pfad={pfad} />
      <main id="inhalt" ref={main}>
        <Seite pfad={pfad} />
      </main>
      <Fuss />
    </>
  );
}
