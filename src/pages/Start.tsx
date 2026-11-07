import { useDatumFormat } from "../components/FristText";
import { ui } from "../i18n/ui";
import { tx, useSprache } from "../i18n/sprache";
import { lebenslagen } from "../inhalte/lebenslagen";
import { neuigkeiten } from "../inhalte/neuigkeiten";
import { useDaten } from "../lib/daten";
import { heute, tageBis } from "../lib/datum";
import { erstelleFahrplan } from "../lib/fahrplan";
import { link } from "../lib/router";
import { sammleTermine } from "../lib/termine";

const T = {
  titel: tx("Was steht bei Ihnen an?", "What's coming up for you?", "Что у вас происходит?"),
  einleitung: tx(
    "Erzählen Sie uns Ihre Situation. Sie bekommen einen persönlichen Fahrplan: welche Anträge, welche Unterlagen, bis wann. Ihre Angaben bleiben auf Ihrem Gerät.",
    "Tell us your situation. You get a personal roadmap: which applications, which documents, by when. Your information stays on your device.",
    "Расскажите о своей ситуации. Вы получите личный план: какие заявления, какие документы и до какого срока. Ваши данные остаются на вашем устройстве.",
  ),
  ihre: tx("Ihre Fahrpläne", "Your roadmaps", "Ваши планы"),
  erledigt: (a: number, b: number) => tx(`${a} von ${b} erledigt`, `${a} of ${b} done`, `Выполнено ${a} из ${b}`),
  naechstes: tx("Als Nächstes fällig", "Due next", "Ближайшие сроки"),
  alleTermine: tx("Alle Termine", "All dates", "Все сроки"),
  lagen: tx("Lebenslagen", "Life events", "Жизненные ситуации"),
  werkzeuge: tx("Werkzeuge", "Tools", "Инструменты"),
  neu: tx("Neu und wichtig", "New and important", "Новое и важное"),
  alleNeu: tx("Alle Neuigkeiten", "All news", "Все новости"),
  ueberfaellig: tx("überfällig", "overdue", "просрочено"),
};

const WERKZEUGE = [
  {
    pfad: "/check",
    titel: tx("Anspruchs-Check", "Benefits check", "Проверка права на пособия"),
    text: tx("Welches Geld steht mir zu?", "Which money am I entitled to?", "Какие выплаты мне положены?"),
  },
  {
    pfad: "/brief",
    titel: tx("Brief verstehen", "Understand a letter", "Понять письмо"),
    text: tx("Was will das Amt von mir, bis wann?", "What does the office want, and by when?", "Чего хочет ведомство и к какому сроку?"),
  },
  {
    pfad: "/umzug-melden",
    titel: tx("Umzug melden", "Report a move", "Сообщить о переезде"),
    text: tx("Briefe an alle Stellen auf einmal", "Letters to everyone in one go", "Письма во все организации сразу"),
  },
  {
    pfad: "/antrag/wohnsitzanmeldung",
    titel: tx("Wohnung anmelden", "Register your address", "Прописаться"),
    text: tx("Ausfüllhilfe für das Bürgeramt", "Form helper for the Bürgeramt", "Помощь с бланком для Bürgeramt"),
  },
];

export function Start() {
  const { t } = useSprache();
  const { daten, status } = useDaten();
  const { datum, relativ } = useDatumFormat();
  const h = heute();
  const gestartet = lebenslagen.filter((l) => daten.lagen[l.id]);
  const naechste = sammleTermine(daten, h)
    .filter((x) => x.art !== "etwa" && tageBis(x.datum, h) >= -14)
    .slice(0, 3);
  const neueste = neuigkeiten.filter((n) => !n.geplant).slice(0, 2);

  return (
    <section className="seite start">
      <h1 tabIndex={-1} className="start-titel">
        {t(T.titel)}
      </h1>
      <p className="einleitung">{t(T.einleitung)}</p>

      {status === "gesperrt" && (
        <p className="hinweis">
          {t(ui.gesperrtHinweis)} <a href={link("/mein")}>{t(ui.entsperren)}</a>
        </p>
      )}

      {gestartet.length > 0 && (
        <section aria-labelledby="ihre" className="block">
          <h2 id="ihre">{t(T.ihre)}</h2>
          <ul className="karten">
            {gestartet.map((l) => {
              const stand = daten.lagen[l.id];
              const plan = erstelleFahrplan(l, stand.antworten, stand.erledigt, h);
              const fertig = plan.filter((s) => s.status === "erledigt").length;
              return (
                <li key={l.id}>
                  <a href={link(`/lage/${l.id}`)} className="karte">
                    <span className="karte-titel">{t(l.titel)}</span>
                    <span className="fortschritt" aria-hidden="true">
                      <span style={{ width: `${(fertig / Math.max(plan.length, 1)) * 100}%` }} />
                    </span>
                    <span className="karte-text">{t(T.erledigt(fertig, plan.length))}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {naechste.length > 0 && (
        <section aria-labelledby="naechstes" className="block">
          <h2 id="naechstes">{t(T.naechstes)}</h2>
          <ul className="fristliste">
            {naechste.map((x) => {
              const tage = tageBis(x.datum, h);
              return (
                <li key={x.id} className={tage < 0 ? "frist-rot" : tage <= 7 ? "frist-gelb" : undefined}>
                  <span className="frist-datum">
                    {datum(x.datum)}
                    <span className="relativ"> · {tage < 0 && x.art === "frist" ? t(T.ueberfaellig) : relativ(x.datum)}</span>
                  </span>
                  <span>{t(x.titel)}</span>
                </li>
              );
            })}
          </ul>
          <p>
            <a href={link("/termine")}>{t(T.alleTermine)}</a>
          </p>
        </section>
      )}

      <section aria-labelledby="lagen" className="block">
        <h2 id="lagen" className="sr">
          {t(T.lagen)}
        </h2>
        <ul className="lagen">
          {lebenslagen.map((l) => (
            <li key={l.id} className="lage">
              <a href={link(`/lage/${l.id}`)}>
                <span className="lage-titel">{t(l.titel)}</span>
                <span className="lage-text">{t(l.kurz)}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="werkzeuge" className="block">
        <h2 id="werkzeuge">{t(T.werkzeuge)}</h2>
        <ul className="kacheln">
          {WERKZEUGE.map((w) => (
            <li key={w.pfad}>
              <a href={link(w.pfad)} className="kachel">
                <span className="kachel-titel">{t(w.titel)}</span>
                <span className="kachel-text">{t(w.text)}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="neu" className="block">
        <h2 id="neu">{t(T.neu)}</h2>
        <ul className="neu-liste">
          {neueste.map((n) => (
            <li key={n.id}>
              <strong>{t(n.titel)}</strong>
              <span>{t(n.text)}</span>
            </li>
          ))}
        </ul>
        <p>
          <a href={link("/neuigkeiten")}>{t(T.alleNeu)}</a>
        </p>
      </section>
    </section>
  );
}
