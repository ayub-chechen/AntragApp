import type { ReactNode } from "react";
import { ui } from "../i18n/ui";
import { SPRACHEN, useSprache } from "../i18n/sprache";
import { useDaten } from "../lib/daten";
import { heute, tageBis } from "../lib/datum";
import { link } from "../lib/router";
import { sammleTermine } from "../lib/termine";

const ICONS: Record<string, ReactNode> = {
  start: <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z" />,
  check: <path d="M4 12.5l5 5L20 6.5" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />,
  termine: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" fill="none" strokeWidth="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" fill="none" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  mein: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 018 0v2.5" fill="none" strokeWidth="2.2" />
    </>
  ),
  mehr: (
    <>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </>
  ),
};

function aktivFuer(pfad: string, ziel: string): boolean {
  if (ziel === "/") return pfad === "/" || pfad.startsWith("/lage/") || pfad.startsWith("/antrag/");
  if (ziel === "/mehr")
    return ["/mehr", "/brief", "/umzug-melden", "/hilfe", "/neuigkeiten", "/anleitung", "/organisationen", "/datenschutz"].some((p) => pfad.startsWith(p));
  return pfad.startsWith(ziel);
}

export function Kopf() {
  const { t, sprache, setSprache } = useSprache();
  return (
    <header className="kopf">
      <div className="kopf-innen">
        <a className="marke" href={link("/")}>
          <svg aria-hidden="true" viewBox="0 0 64 64" width="30" height="30">
            <rect width="64" height="64" rx="14" fill="#2d5463" />
            <path d="M14 46h36" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
            <circle cx="20" cy="46" r="6" fill="#fff" />
            <circle cx="44" cy="46" r="6" fill="#ffd400" stroke="#fff" strokeWidth="3" />
            <path d="M44 14v22" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
            <path d="M44 14l-10 6 10 6" fill="#ffd400" />
          </svg>
          {t(ui.app)}
        </a>
        <div className="sprachen" role="group" aria-label={t(ui.sprache)}>
          {SPRACHEN.map((s) => (
            <button key={s.id} type="button" lang={s.id} aria-pressed={sprache === s.id} onClick={() => setSprache(s.id)} title={s.name}>
              <span aria-hidden="true">{s.kurz}</span>
              <span className="sr">{s.name}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

export function Navigation({ pfad }: { pfad: string }) {
  const { t } = useSprache();
  const { daten } = useDaten();
  const bald = sammleTermine(daten, heute()).filter((x) => x.art !== "etwa" && tageBis(x.datum) >= 0 && tageBis(x.datum) <= 7).length;
  const punkte = [
    { ziel: "/", text: ui.navStart, icon: "start" },
    { ziel: "/check", text: ui.navCheck, icon: "check" },
    { ziel: "/termine", text: ui.navTermine, icon: "termine", zahl: bald },
    { ziel: "/mein", text: ui.navMein, icon: "mein" },
    { ziel: "/mehr", text: ui.navMehr, icon: "mehr" },
  ];
  return (
    <nav className="leiste" aria-label={t(ui.hauptnavigation)}>
      <ul>
        {punkte.map((p) => (
          <li key={p.ziel}>
            <a href={link(p.ziel)} aria-current={aktivFuer(pfad, p.ziel) ? "page" : undefined}>
              <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="currentColor" strokeWidth="0">
                {ICONS[p.icon]}
              </svg>
              <span>{t(p.text)}</span>
              {p.zahl ? (
                <span className="zaehler">
                  {p.zahl}
                  <span className="sr"> {t({ de: "bald fällig", en: "due soon", ru: "скоро срок" })}</span>
                </span>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Fuss() {
  const { t } = useSprache();
  return (
    <footer className="fuss">
      <p>{t(ui.keineRechtsberatung)}</p>
      <p className="fuss-links">
        <a href={link("/anleitung")}>{t(ui.anleitung)}</a>
        <a href={link("/datenschutz")}>{t(ui.datenschutz)}</a>
        <a href={link("/organisationen")}>{t({ de: "Für Organisationen", en: "For organisations", ru: "Для организаций" })}</a>
      </p>
    </footer>
  );
}
