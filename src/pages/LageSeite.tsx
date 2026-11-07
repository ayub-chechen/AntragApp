import { useRef, useState } from "react";
import { FragenFormular } from "../components/FragenFormular";
import { FristText, useDatumFormat } from "../components/FristText";
import { Vorlesen } from "../components/Vorlesen";
import { ui } from "../i18n/ui";
import { tx, useSprache } from "../i18n/sprache";
import type { Lebenslage } from "../inhalte/typen";
import { useDaten } from "../lib/daten";
import { heute } from "../lib/datum";
import { kopiere } from "../lib/download";
import { erstelleFahrplan, type Status } from "../lib/fahrplan";
import { link } from "../lib/router";

const T = {
  alle: tx("Alle Lebenslagen", "All life events", "Все жизненные ситуации"),
  fragenEinleitung: tx(
    "Ein paar kurze Fragen, dann sehen Sie Ihren persönlichen Fahrplan mit allen Fristen.",
    "A few short questions, then you'll see your personal roadmap with all deadlines.",
    "Несколько коротких вопросов — и вы увидите личный план со всеми сроками.",
  ),
  erstellen: tx("Fahrplan erstellen", "Create roadmap", "Составить план"),
  fahrplan: tx("Ihr Fahrplan", "Your roadmap", "Ваш план"),
  schritte: (n: number, offen: number) => tx(`${n} Schritte, davon ${offen} offen.`, `${n} steps, ${offen} still open.`, `Шагов: ${n}, из них открыто: ${offen}.`),
  aendern: tx("Antworten ändern", "Change answers", "Изменить ответы"),
  entfernen: tx("Fahrplan entfernen", "Remove roadmap", "Удалить план"),
  drucken: tx("Drucken", "Print", "Печать"),
  teilen: tx("Teilen", "Share", "Поделиться"),
  kopiert: tx("Fahrplan als Text kopiert.", "Roadmap copied as text.", "План скопирован как текст."),
  erledigt: tx("Erledigt", "Done", "Готово"),
  markieren: tx("Als erledigt markieren", "Mark as done", "Отметить как выполненное"),
  ueberfaellig: tx("Frist vorbei", "Deadline passed", "Срок прошёл"),
  bald: tx("Bald fällig", "Due soon", "Скоро срок"),
  wo: tx("Wo", "Where", "Где"),
  geld: tx("Geld", "Money", "Деньги"),
  unterlagen: tx("Das brauchen Sie", "What you need", "Что понадобится"),
  imOrdner: tx("liegt im Ordner", "in your folder", "есть в папке"),
  grundlage: tx("Grundlage", "Legal basis", "Основание"),
  tipp: tx("Gut zu wissen", "Good to know", "Полезно знать"),
  hilfe: tx(
    "Unsicher? Kostenlose Beratungsstellen helfen weiter.",
    "Unsure? Free advice centres can help.",
    "Сомневаетесь? Помогут бесплатные консультации.",
  ),
  hilfeLink: tx("Hilfe finden", "Find help", "Найти помощь"),
  orientierung: tx(
    "Der Fahrplan ist eine Orientierung nach Ihren Angaben. Maßgeblich sind die Hinweise der Ämter.",
    "The roadmap is guidance based on your answers. The offices' instructions are what counts.",
    "План — ориентир по вашим ответам. Решающее значение имеют указания ведомств.",
  ),
};

const STATUS_TEXT: Partial<Record<Status, typeof T.bald>> = { ueberfaellig: T.ueberfaellig, bald: T.bald };

export function LageSeite({ lage }: { lage: Lebenslage }) {
  const { t } = useSprache();
  const { daten, aendere, status } = useDaten();
  const { datum } = useDatumFormat();
  const stand = daten.lagen[lage.id];
  const [bearbeiten, setBearbeiten] = useState(!stand);
  const [meldung, setMeldung] = useState("");
  const planRef = useRef<HTMLDivElement>(null);
  const titelRef = useRef<HTMLHeadingElement>(null);

  const speichere = (antworten: Record<string, string>) => {
    aendere((d) => ({ ...d, lagen: { ...d.lagen, [lage.id]: { antworten, erledigt: d.lagen[lage.id]?.erledigt ?? [] } } }));
    setBearbeiten(false);
    window.scrollTo(0, 0);
    setTimeout(() => titelRef.current?.focus(), 0);
  };

  const umschalten = (id: string) =>
    aendere((d) => {
      const s = d.lagen[lage.id];
      const erledigt = s.erledigt.includes(id) ? s.erledigt.filter((x) => x !== id) : [...s.erledigt, id];
      return { ...d, lagen: { ...d.lagen, [lage.id]: { ...s, erledigt } } };
    });

  const entfernen = () => {
    aendere((d) => {
      const { [lage.id]: _, ...rest } = d.lagen;
      return { ...d, lagen: rest };
    });
    setBearbeiten(true);
  };

  if (bearbeiten || !stand) {
    return (
      <section className="seite">
        <p className="zurueck">
          <a href={link("/")}>{t(T.alle)}</a>
        </p>
        <h1 tabIndex={-1}>{t(lage.titel)}</h1>
        <p className="einleitung">{t(T.fragenEinleitung)}</p>
        <div className="schritt">
          <FragenFormular gruppen={[{ fragen: lage.fragen }]} start={stand?.antworten ?? {}} knopf={T.erstellen} onFertig={speichere} />
        </div>
        {status !== "offen" && <p className="klein-hinweis">{t(ui.nurFenster)}</p>}
      </section>
    );
  }

  const plan = erstelleFahrplan(lage, stand.antworten, stand.erledigt, heute());
  const offen = plan.filter((s) => s.status !== "erledigt").length;

  const alsText = () =>
    [
      `${t(lage.titel)} – ${t(T.fahrplan)}`,
      "",
      ...plan.map((s, i) => {
        const d = s.frist?.bis ?? s.frist?.ab ?? s.frist?.etwa;
        return `${i + 1}. ${s.status === "erledigt" ? "✓ " : ""}${t(s.schritt.titel)}${d ? ` (${datum(d)})` : ""}`;
      }),
      "",
      t(T.orientierung),
    ].join("\n");

  const teilen = async () => {
    const text = alsText();
    if (navigator.share) {
      try {
        await navigator.share({ title: t(lage.titel), text });
        return;
      } catch {
        /* abgebrochen: dann kopieren */
      }
    }
    if (await kopiere(text)) setMeldung(t(T.kopiert));
  };

  return (
    <section className="seite">
      <p className="zurueck">
        <a href={link("/")}>{t(T.alle)}</a>
      </p>
      <h1 tabIndex={-1}>{t(lage.titel)}</h1>
      <div className="plan-kopf">
        <h2 ref={titelRef} tabIndex={-1}>
          {t(T.fahrplan)}
        </h2>
        <p>{t(T.schritte(plan.length, offen))}</p>
        <div className="werkzeugleiste">
          <Vorlesen ziel={planRef} />
          <button type="button" className="knopf-klein" onClick={teilen}>
            {t(T.teilen)}
          </button>
          <button type="button" className="knopf-klein" onClick={() => window.print()}>
            {t(T.drucken)}
          </button>
          <button type="button" className="knopf-klein" onClick={() => setBearbeiten(true)}>
            {t(T.aendern)}
          </button>
        </div>
        <p role="status" className="status-zeile">
          {meldung}
        </p>
      </div>

      <div ref={planRef}>
        <ol className="fahrplan">
          {plan.map(({ schritt: s, frist, status: st }) => {
            const erledigt = st === "erledigt";
            return (
              <li key={s.id} className={`halt halt-${st}`}>
                <span className="halt-punkt" aria-hidden="true" />
                <div className="halt-inhalt">
                  <h3>{t(s.titel)}</h3>
                  {(frist || s.fristText) && (
                    <p className="halt-frist">
                      {frist && <FristText frist={frist} />}
                      {!frist && s.fristText && t(s.fristText)}
                      {STATUS_TEXT[st] && <span className={`marke-${st}`}>{t(STATUS_TEXT[st]!)}</span>}
                    </p>
                  )}
                  <p>{t(s.text)}</p>
                  {s.geld && (
                    <p className="geld">
                      <strong>{t(T.geld)}:</strong> {t(s.geld)}
                    </p>
                  )}
                  {s.wo && (
                    <p>
                      <strong>{t(T.wo)}:</strong> {t(s.wo)}
                    </p>
                  )}
                  {s.unterlagen && (
                    <div className="unterlagen">
                      <strong>{t(T.unterlagen)}:</strong>
                      <ul className="haken">
                        {s.unterlagen.map((u, i) => {
                          const da = u.art && daten.dokumente.some((d) => d.art === u.art);
                          return (
                            <li key={i} className={da ? "da" : undefined}>
                              {t(u.text)}
                              {da && <span className="im-ordner"> ✓ {t(T.imOrdner)}</span>}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  {s.tipp && (
                    <p className="tipp">
                      <strong>{t(T.tipp)}:</strong> {t(s.tipp)}
                    </p>
                  )}
                  {frist && s.fristText && (
                    <p className="klein">
                      {t(T.grundlage)}: {t(s.fristText)}
                    </p>
                  )}
                  <div className="halt-aktionen">
                    {s.intern && (
                      <a className="knopf-zweit knopf-mittel" href={link(s.intern.pfad)}>
                        {t(s.intern.text)}
                      </a>
                    )}
                    {s.link && (
                      <a className="extern" href={s.link.url} target="_blank" rel="noopener noreferrer">
                        {t(s.link.text)}
                        <span className="sr"> {t(ui.neuerTab)}</span>
                      </a>
                    )}
                    <button type="button" className={erledigt ? "haken-knopf an" : "haken-knopf"} aria-pressed={erledigt} onClick={() => umschalten(s.id)}>
                      <span aria-hidden="true" className="haken-feld">
                        {erledigt ? "✓" : ""}
                      </span>
                      {t(erledigt ? T.erledigt : T.markieren)}
                      <span className="sr">: {t(s.titel)}</span>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <p className="hinweis">{t(T.orientierung)}</p>
      <p>
        {t(T.hilfe)} <a href={link("/hilfe")}>{t(T.hilfeLink)}</a>
      </p>
      {status !== "offen" && <p className="klein-hinweis">{t(ui.nurFenster)}</p>}
      <div className="loeschen">
        <button type="button" className="knopf-leise" onClick={entfernen}>
          {t(T.entfernen)}
        </button>
      </div>
    </section>
  );
}
