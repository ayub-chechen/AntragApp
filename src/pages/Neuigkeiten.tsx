import { useDatumFormat } from "../components/FristText";
import { ui } from "../i18n/ui";
import { tx, useSprache } from "../i18n/sprache";
import { lebenslagen } from "../inhalte/lebenslagen";
import { neuigkeiten } from "../inhalte/neuigkeiten";
import { pruefeAnsprueche } from "../lib/check";
import { useDaten } from "../lib/daten";

const T = {
  titel: tx("Neuigkeiten", "News", "Новости"),
  einleitung: tx(
    "Was sich bei Anträgen und Leistungen ändert. Was zu Ihren Fahrplänen oder Ihrem Check passt, ist markiert.",
    "What is changing in applications and benefits. Items matching your roadmaps or your check are marked.",
    "Что меняется в заявлениях и пособиях. То, что касается ваших планов или проверки, отмечено.",
  ),
  stand: tx("Stand: 7. November 2026", "As of 7 November 2026", "По состоянию на 7 ноября 2026"),
  seit: tx("gilt seit", "since", "действует с"),
  geplant: tx("geplant ab", "planned from", "планируется с"),
  betrifft: tx("Betrifft Sie", "Relevant to you", "Касается вас"),
  mehr: tx("Mehr dazu", "More", "Подробнее"),
};

export function Neuigkeiten() {
  const { t } = useSprache();
  const { daten } = useDaten();
  const { datum } = useDatumFormat();
  const relevant = new Set<string>([
    ...lebenslagen.filter((l) => daten.lagen[l.id]).map((l) => l.id),
    ...(Object.keys(daten.check).length ? pruefeAnsprueche(daten.check).map((e) => e.id) : []),
  ]);
  return (
    <section className="seite">
      <h1 tabIndex={-1}>{t(T.titel)}</h1>
      <p className="einleitung">{t(T.einleitung)}</p>
      <p className="klein">{t(T.stand)}</p>
      <ul className="neu-liste gross">
        {neuigkeiten.map((n) => {
          const fuerSie = n.betrifft.some((b) => relevant.has(b));
          return (
            <li key={n.id} className={fuerSie ? "fuer-sie" : undefined}>
              <p className="klein">
                {t(n.geplant ? T.geplant : T.seit)} {datum(new Date(`${n.ab}T00:00:00`))}
                {fuerSie && <span className="marke-bald">{t(T.betrifft)}</span>}
              </p>
              <h2>{t(n.titel)}</h2>
              <p>{t(n.text)}</p>
              {n.link && (
                <a className="extern" href={n.link} target="_blank" rel="noopener noreferrer">
                  {t(T.mehr)}
                  <span className="sr">
                    : {t(n.titel)} {t(ui.neuerTab)}
                  </span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
