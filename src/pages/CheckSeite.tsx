import { useRef, useState } from "react";
import { FragenFormular } from "../components/FragenFormular";
import { Vorlesen } from "../components/Vorlesen";
import { ui } from "../i18n/ui";
import { tx, useSprache } from "../i18n/sprache";
import { checkFragen } from "../inhalte/checkFragen";
import { findeLage } from "../inhalte/lebenslagen";
import { findeLeistung } from "../inhalte/leistungen";
import { euro, pruefeAnsprueche, type CheckErgebnis, type Stufe } from "../lib/check";
import { useDaten } from "../lib/daten";
import { alterAm, lies } from "../lib/datum";
import { link } from "../lib/router";

const T = {
  titel: tx("Anspruchs-Check", "Benefits check", "Проверка права на пособия"),
  einleitung: tx(
    "Ein paar Fragen zu Ihrem Haushalt. Danach sehen Sie, welche Leistungen in Frage kommen, ungefähr wie viel und wo Sie sie beantragen. Ihre Antworten bleiben auf dem Gerät.",
    "A few questions about your household. Then you'll see which benefits may apply, roughly how much, and where to apply. Your answers stay on your device.",
    "Несколько вопросов о вашей семье. Затем вы увидите, какие пособия могут подойти, примерно сколько и где их оформить. Ответы остаются на устройстве.",
  ),
  zeigen: tx("Ergebnis zeigen", "Show result", "Показать результат"),
  ergebnis: tx("Ihr Ergebnis", "Your result", "Ваш результат"),
  neu: tx("Antworten ändern", "Change answers", "Изменить ответы"),
  keine: tx(
    "Nach Ihren Angaben haben wir nichts Passendes gefunden. Das heißt nicht, dass Sie keinen Anspruch haben. Eine Beratungsstelle kann genauer prüfen.",
    "Based on your answers we found nothing that fits. That doesn't mean you aren't entitled. An advice centre can check more closely.",
    "По вашим ответам ничего подходящего не нашлось. Это не значит, что права нет. Консультация может проверить точнее.",
  ),
  stufe: {
    wahrscheinlich: tx("Steht Ihnen wahrscheinlich zu", "You are probably entitled", "Вероятно, вам положено"),
    pruefen: tx("Prüfen lohnt sich", "Worth checking", "Стоит проверить"),
    hinweis: tx("Auch wichtig für Sie", "Also relevant for you", "Тоже важно для вас"),
  } as Record<Stufe, ReturnType<typeof tx>>,
  warum: tx("Warum", "Why", "Почему"),
  wo: tx("Beantragen bei", "Apply at", "Куда подавать"),
  imMonat: tx("im Monat", "per month", "в месяц"),
  etwa: tx("etwa", "about", "около"),
  bis: tx("bis zu", "up to", "до"),
  offiziell: tx("Offizielle Seite", "Official page", "Официальная страница"),
  fahrplan: tx("Zum Fahrplan", "Go to roadmap", "К плану"),
  vorsicht: tx(
    "Das ist eine grobe Orientierung, keine Zusage und keine Rechtsberatung. Ob und wie viel Sie bekommen, entscheidet das Amt. Beträge Stand 2026.",
    "This is rough guidance, not a promise and not legal advice. The office decides whether and how much you get. Amounts as of 2026.",
    "Это примерный ориентир, а не обещание и не юридическая консультация. Решение о выплате и её размере принимает ведомство. Суммы на 2026 год.",
  ),
};

function Betrag({ e }: { e: CheckErgebnis }) {
  const { t } = useSprache();
  if (!e.betrag) return null;
  const text =
    e.betrag.art === "spanne"
      ? `${t(euro(e.betrag.von))} – ${t(euro(e.betrag.bis))}`
      : `${t(e.betrag.art === "bis" ? T.bis : T.etwa)} ${t(euro(e.betrag.wert))}`;
  if (e.betrag.art !== "spanne" && e.betrag.wert <= 0) return null;
  return (
    <p className="betrag">
      {text} <span>{t(T.imMonat)}</span>
    </p>
  );
}

export function CheckSeite() {
  const { t } = useSprache();
  const { daten, aendere, status } = useDaten();
  const [zeigen, setZeigen] = useState(Object.keys(daten.check).length > 0);
  const ergebnisRef = useRef<HTMLDivElement>(null);
  const titelRef = useRef<HTMLHeadingElement>(null);

  const start = { ...daten.check };
  if (!start.kinder_alter && daten.kinder.length) {
    start.kinder_alter = daten.kinder
      .map((k) => lies(k.geburtsdatum))
      .filter((d): d is Date => !!d)
      .map((d) => String(alterAm(d)))
      .join(", ");
  }
  if (!start.alter && lies(daten.profil["person.geburtsdatum"])) start.alter = String(alterAm(lies(daten.profil["person.geburtsdatum"])!));

  if (!zeigen) {
    return (
      <section className="seite">
        <h1 tabIndex={-1}>{t(T.titel)}</h1>
        <p className="einleitung">{t(T.einleitung)}</p>
        <div className="schritt">
          <FragenFormular
            gruppen={checkFragen}
            start={start}
            knopf={T.zeigen}
            onFertig={(a) => {
              aendere((d) => ({ ...d, check: a }));
              setZeigen(true);
              window.scrollTo(0, 0);
              setTimeout(() => titelRef.current?.focus(), 0);
            }}
          />
        </div>
        {status !== "offen" && <p className="klein-hinweis">{t(ui.nurFenster)}</p>}
      </section>
    );
  }

  const ergebnisse = pruefeAnsprueche(daten.check);
  const stufen: Stufe[] = ["wahrscheinlich", "pruefen", "hinweis"];

  return (
    <section className="seite">
      <h1 tabIndex={-1}>{t(T.titel)}</h1>
      <div className="plan-kopf">
        <h2 ref={titelRef} tabIndex={-1}>
          {t(T.ergebnis)}
        </h2>
        <div className="werkzeugleiste">
          <Vorlesen ziel={ergebnisRef} />
          <button type="button" className="knopf-klein" onClick={() => setZeigen(false)}>
            {t(T.neu)}
          </button>
        </div>
      </div>
      <div ref={ergebnisRef}>
        {ergebnisse.length === 0 && <p className="hinweis">{t(T.keine)}</p>}
        {stufen.map((stufe) => {
          const liste = ergebnisse.filter((e) => e.stufe === stufe);
          if (!liste.length) return null;
          return (
            <section key={stufe} aria-labelledby={`stufe-${stufe}`} className={`stufe stufe-${stufe}`}>
              <h3 id={`stufe-${stufe}`}>{t(T.stufe[stufe])}</h3>
              <ul className="ergebnisse">
                {liste.map((e) => {
                  const l = findeLeistung(e.id)!;
                  const lage = l.lage ? findeLage(l.lage) : undefined;
                  return (
                    <li key={e.id} className="ergebnis">
                      <h4>{t(l.name)}</h4>
                      <Betrag e={e} />
                      <p>{t(l.was)}</p>
                      <p>
                        <strong>{t(T.warum)}:</strong> {e.gruende.map((g) => t(g)).join(" ")}
                      </p>
                      <p>
                        <strong>{t(T.wo)}:</strong> {t(l.wo)}
                        {l.frist && <> · {t(l.frist)}</>}
                      </p>
                      <p className="halt-aktionen">
                        {lage && (
                          <a className="knopf-zweit knopf-mittel" href={link(`/lage/${lage.id}`)}>
                            {t(T.fahrplan)}: {t(lage.titel)}
                          </a>
                        )}
                        {l.link && (
                          <a className="extern" href={l.link} target="_blank" rel="noopener noreferrer">
                            {t(T.offiziell)}
                            <span className="sr"> {t(ui.neuerTab)}</span>
                          </a>
                        )}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
      <p className="hinweis">{t(T.vorsicht)}</p>
    </section>
  );
}
