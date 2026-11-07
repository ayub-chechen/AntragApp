import { useState } from "react";
import { FrageFeld } from "../components/FrageFeld";
import { useDatumFormat } from "../components/FristText";
import { ui } from "../i18n/ui";
import { tx, useSprache, type Tx } from "../i18n/sprache";
import { neueId, useDaten } from "../lib/daten";
import { heute, lies, tageBis } from "../lib/datum";
import { ladeHerunter } from "../lib/download";
import { erzeugeIcs } from "../lib/kalender";
import { link } from "../lib/router";
import { sammleTermine, type AppTermin } from "../lib/termine";
import { normalisiereDatum } from "../lib/validierung";

const T = {
  titel: tx("Termine und Fristen", "Dates and deadlines", "Сроки и встречи"),
  einleitung: tx(
    "Alle Fristen aus Ihren Fahrplänen, ablaufende Unterlagen und eigene Termine an einem Ort. Übernehmen Sie sie in Ihren Kalender, dann erinnert Ihr Handy Sie rechtzeitig.",
    "All deadlines from your roadmaps, expiring documents and your own appointments in one place. Add them to your calendar and your phone will remind you in time.",
    "Все сроки из ваших планов, истекающие документы и свои встречи в одном месте. Добавьте их в календарь — и телефон напомнит вовремя.",
  ),
  leer: tx(
    "Noch keine Termine. Wählen Sie auf der Startseite eine Lebenslage, dann erscheinen hier Ihre Fristen.",
    "No dates yet. Choose a life event on the home page and your deadlines will appear here.",
    "Пока сроков нет. Выберите жизненную ситуацию на главной — и здесь появятся ваши сроки.",
  ),
  vorbei: tx("Vorbei oder überfällig", "Past or overdue", "Прошедшие или просроченные"),
  woche: tx("In den nächsten 7 Tagen", "In the next 7 days", "В ближайшие 7 дней"),
  monat: tx("In den nächsten 30 Tagen", "In the next 30 days", "В ближайшие 30 дней"),
  spaeter: tx("Später", "Later", "Позже"),
  alleKalender: tx("Alle in den Kalender (.ics)", "Add all to calendar (.ics)", "Все в календарь (.ics)"),
  inKalender: tx("In den Kalender", "Add to calendar", "В календарь"),
  kalenderHilfe: tx(
    "Die Datei öffnet Ihre Kalender-App. Sie erinnert 3 Tage vorher und am Vortag.",
    "The file opens your calendar app. It reminds you 3 days before and the day before.",
    "Файл откроется в приложении календаря. Напомнит за 3 дня и накануне.",
  ),
  eigener: tx("Eigenen Termin eintragen", "Add your own appointment", "Добавить свою встречу"),
  was: tx("Was?", "What?", "Что?"),
  wann: tx("Datum", "Date", "Дата"),
  uhr: tx("Uhrzeit", "Time", "Время"),
  uhrHilfe: tx("z. B. 09:30", "e.g. 09:30", "например 09:30"),
  notiz: tx("Notiz", "Note", "Заметка"),
  hinzufuegen: tx("Termin speichern", "Save appointment", "Сохранить встречу"),
  art: {
    frist: tx("Frist", "Deadline", "Срок"),
    ab: tx("Möglich ab", "Possible from", "Можно с"),
    etwa: tx("Erwartet um", "Expected around", "Ожидается около"),
    eigener: tx("Eigener Termin", "Own appointment", "Своя встреча"),
    ablauf: tx("Läuft ab", "Expires", "Истекает"),
  } as Record<AppTermin["art"], Tx>,
};

export function TermineSeite() {
  const { t } = useSprache();
  const { daten, aendere, status } = useDaten();
  const { datum, lang, relativ } = useDatumFormat();
  const [neu, setNeu] = useState({ titel: "", datum: "", uhrzeit: "", notiz: "" });
  const [fehler, setFehler] = useState<Record<string, string>>({});
  const h = heute();
  const termine = sammleTermine(daten, h);

  const gruppen: { titel: Tx; liste: AppTermin[] }[] = [
    { titel: T.vorbei, liste: termine.filter((x) => tageBis(x.datum, h) < 0) },
    { titel: T.woche, liste: termine.filter((x) => tageBis(x.datum, h) >= 0 && tageBis(x.datum, h) <= 7) },
    { titel: T.monat, liste: termine.filter((x) => tageBis(x.datum, h) > 7 && tageBis(x.datum, h) <= 30) },
    { titel: T.spaeter, liste: termine.filter((x) => tageBis(x.datum, h) > 30) },
  ];

  const ics = (liste: AppTermin[], name: string) =>
    ladeHerunter(
      erzeugeIcs(
        liste.map((x) => ({
          id: x.id,
          titel: `${x.art === "frist" ? `${t(T.art.frist)}: ` : ""}${t(x.titel)}`,
          datum: x.datum,
          uhrzeit: x.uhrzeit,
          beschreibung: [x.notiz ? t(x.notiz) : "", x.quelle ? `${t(ui.app)}: ${t(x.quelle.text)}` : ""].filter(Boolean).join("\n"),
        })),
      ),
      name,
      "text/calendar",
    );

  const speichern = (e: React.FormEvent) => {
    e.preventDefault();
    const d = normalisiereDatum(neu.datum);
    const f: Record<string, string> = {};
    if (!neu.titel.trim()) f.titel = t(ui.pflichtFehler);
    if (!lies(d)) f.datum = t(ui.datumFehler);
    if (neu.uhrzeit && !/^\d{1,2}[:.]\d{2}$/.test(neu.uhrzeit.trim())) f.uhrzeit = t(T.uhrHilfe);
    setFehler(f);
    if (Object.keys(f).length) return;
    aendere((x) => ({
      ...x,
      termine: [...x.termine, { id: neueId(), titel: neu.titel.trim(), datum: d, uhrzeit: neu.uhrzeit.trim().replace(".", ":") || undefined, notiz: neu.notiz.trim() || undefined }],
    }));
    setNeu({ titel: "", datum: "", uhrzeit: "", notiz: "" });
  };

  return (
    <section className="seite">
      <h1 tabIndex={-1}>{t(T.titel)}</h1>
      <p className="einleitung">{t(T.einleitung)}</p>

      {termine.length === 0 ? (
        <p className="hinweis">
          {t(T.leer)} <a href={link("/")}>{t(ui.navStart)}</a>
        </p>
      ) : (
        <>
          <div className="aktionen aktionen-oben">
            <button type="button" className="knopf" onClick={() => ics(termine.filter((x) => tageBis(x.datum, h) >= 0), "antragslotse-termine.ics")}>
              {t(T.alleKalender)}
            </button>
          </div>
          <p className="hilfe">{t(T.kalenderHilfe)}</p>
          {gruppen.map(
            (g) =>
              g.liste.length > 0 && (
                <section key={t(g.titel)} className="termin-gruppe" aria-label={t(g.titel)}>
                  <h2>{t(g.titel)}</h2>
                  <ul className="terminliste">
                    {g.liste.map((x) => {
                      const tage = tageBis(x.datum, h);
                      return (
                        <li key={x.id} className={tage < 0 && x.art === "frist" ? "termin frist-rot" : tage <= 7 && x.art === "frist" ? "termin frist-gelb" : "termin"}>
                          <div className="termin-datum">
                            <span className="termin-art">{t(T.art[x.art])}</span>
                            <strong>{lang(x.datum)}</strong>
                            {x.uhrzeit && <span>, {x.uhrzeit}</span>}
                            <span className="relativ"> · {relativ(x.datum)}</span>
                          </div>
                          <div className="termin-titel">{t(x.titel)}</div>
                          {x.notiz && <p className="klein">{t(x.notiz)}</p>}
                          <div className="halt-aktionen">
                            {x.quelle && <a href={link(x.quelle.pfad)}>{t(x.quelle.text)}</a>}
                            <button type="button" className="knopf-klein" onClick={() => ics([x], `termin-${datum(x.datum).replace(/\D/g, "")}.ics`)}>
                              {t(T.inKalender)}
                              <span className="sr">: {t(x.titel)}</span>
                            </button>
                            {x.art === "eigener" && (
                              <button
                                type="button"
                                className="knopf-leise"
                                onClick={() => aendere((d) => ({ ...d, termine: d.termine.filter((y) => `eigen-${y.id}` !== x.id) }))}
                              >
                                {t(ui.loeschen)}
                                <span className="sr">: {t(x.titel)}</span>
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ),
          )}
        </>
      )}

      <section className="schritt eigener-termin" aria-labelledby="eigener">
        <h2 id="eigener">{t(T.eigener)}</h2>
        <form noValidate onSubmit={speichern}>
          <FrageFeld frage={{ id: "t_titel", typ: "text", pflicht: true, frage: T.was }} wert={neu.titel} fehler={fehler.titel} onChange={(v) => setNeu({ ...neu, titel: v })} />
          <FrageFeld frage={{ id: "t_datum", typ: "datum", pflicht: true, frage: T.wann }} wert={neu.datum} fehler={fehler.datum} onChange={(v) => setNeu({ ...neu, datum: v })} />
          <FrageFeld
            frage={{ id: "t_uhr", typ: "text", frage: T.uhr, hilfe: T.uhrHilfe }}
            wert={neu.uhrzeit}
            fehler={fehler.uhrzeit}
            onChange={(v) => setNeu({ ...neu, uhrzeit: v })}
          />
          <FrageFeld frage={{ id: "t_notiz", typ: "text", frage: T.notiz }} wert={neu.notiz} onChange={(v) => setNeu({ ...neu, notiz: v })} />
          <button type="submit" className="knopf">
            {t(T.hinzufuegen)}
          </button>
        </form>
      </section>
      {status !== "offen" && <p className="klein-hinweis">{t(ui.nurFenster)}</p>}
    </section>
  );
}
