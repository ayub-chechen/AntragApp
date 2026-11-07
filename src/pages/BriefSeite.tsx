import { useRef, useState } from "react";
import { FrageFeld } from "../components/FrageFeld";
import { useDatumFormat } from "../components/FristText";
import { Vorlesen } from "../components/Vorlesen";
import { tx, useSprache } from "../i18n/sprache";
import { vorlagen } from "../inhalte/briefe";
import { adresszeilen, name } from "../inhalte/profil";
import { analysiere, type Analyse } from "../lib/brieferklaerer";
import { neueId, useDaten } from "../lib/daten";
import { alsText, heute, lies } from "../lib/datum";
import { kopiere, ladeHerunter, ladePdfWerkzeug } from "../lib/download";
import { link } from "../lib/router";
import { normalisiereDatum } from "../lib/validierung";
import type { Brief } from "../lib/briefPdf";

const BEISPIEL = `Jobcenter Berlin Mitte
Berlin, den 02.11.2026
BG-Nummer: 96301BG0012345

Aufforderung zur Mitwirkung

Sehr geehrte Frau Beispiel,

für die Bearbeitung Ihres Weiterbewilligungsantrags benötigen wir noch folgende Unterlagen:
- Kontoauszüge der letzten drei Monate
- Nebenkostenabrechnung 2025

Bitte reichen Sie die Unterlagen bis zum 20.11.2026 ein. Kommen Sie Ihrer Mitwirkungspflicht nicht nach, können die Leistungen nach § 66 SGB I ganz oder teilweise versagt werden.

Rechtsbehelfsbelehrung
Gegen diesen Bescheid kann innerhalb eines Monats nach Bekanntgabe Widerspruch erhoben werden.`;

const T = {
  titel: tx("Brief vom Amt verstehen", "Understand a letter from an office", "Понять письмо из ведомства"),
  einleitung: tx(
    "Fügen Sie den Text eines Briefes ein. Sie erfahren, was das Amt will, welche Fristen gelten und was die Fachwörter bedeuten. Der Text bleibt auf Ihrem Gerät.",
    "Paste the text of a letter. You'll learn what the office wants, which deadlines apply and what the jargon means. The text stays on your device.",
    "Вставьте текст письма. Вы узнаете, чего хочет ведомство, какие сроки действуют и что значат термины. Текст остаётся на вашем устройстве.",
  ),
  fotoTipp: tx(
    "Tipp: Ihr Handy kann Text aus einem Foto erkennen (iPhone: Live Text, Android: Google Lens). Text markieren, kopieren und hier einfügen.",
    "Tip: your phone can recognise text in a photo (iPhone: Live Text, Android: Google Lens). Select the text, copy it and paste it here.",
    "Совет: телефон умеет распознавать текст на фото (iPhone: Live Text, Android: Google Lens). Выделите текст, скопируйте и вставьте сюда.",
  ),
  text: tx("Text des Briefes", "Text of the letter", "Текст письма"),
  beispiel: tx("Beispiel einfügen", "Insert example", "Вставить пример"),
  briefdatum: tx("Datum des Briefes", "Date of the letter", "Дата письма"),
  briefdatumHilfe: tx("Wird meist erkannt. Steht oben rechts im Brief.", "Usually detected. It's at the top right of the letter.", "Обычно распознаётся. Указана вверху справа."),
  erhalten: tx("Wann haben Sie den Brief bekommen?", "When did you receive the letter?", "Когда вы получили письмо?"),
  erhaltenHilfe: tx("Nur wichtig, wenn er sehr spät ankam.", "Only matters if it arrived very late.", "Важно, только если письмо пришло очень поздно."),
  erklaeren: tx("Brief erklären", "Explain letter", "Объяснить письмо"),
  leer: tx("Bitte fügen Sie zuerst den Text ein.", "Please paste the text first.", "Сначала вставьте текст."),
  ergebnis: tx("Das steht im Brief", "What the letter says", "Что в письме"),
  absender: tx("Absender", "Sender", "Отправитель"),
  unbekannt: tx("nicht erkannt", "not detected", "не распознан"),
  aktenzeichen: tx("Ihr Zeichen", "Your reference", "Ваш номер дела"),
  betraege: tx("Beträge im Brief", "Amounts in the letter", "Суммы в письме"),
  keineArt: tx(
    "Wir konnten die Art des Briefes nicht sicher erkennen. Lesen Sie besonders Betreff, fett gedruckte Sätze und den Schluss.",
    "We could not reliably detect the type of letter. Pay attention to the subject line, bold sentences and the end.",
    "Не удалось точно определить тип письма. Обратите внимание на тему, выделенные фразы и конец письма.",
  ),
  tun: tx("Was Sie tun sollten", "What you should do", "Что нужно сделать"),
  fristen: tx("Fristen und Termine", "Deadlines and appointments", "Сроки и встречи"),
  keineFrist: tx("Keine Frist gefunden. Prüfen Sie den Brief trotzdem auf Daten.", "No deadline found. Still check the letter for dates.", "Сроков не найдено. Всё же проверьте даты в письме."),
  zugang: (d: string) =>
    tx(
      `Gilt als zugestellt am ${d} (Briefdatum plus 4 Tage).`,
      `Counts as delivered on ${d} (letter date plus 4 days).`,
      `Считается доставленным ${d} (дата письма плюс 4 дня).`,
    ),
  verschoben: tx("Fällt auf Wochenende oder Feiertag, deshalb nächster Werktag.", "Falls on a weekend or holiday, so the next working day.", "Приходится на выходной или праздник, поэтому следующий рабочий день."),
  uebernehmen: tx("In Termine übernehmen", "Add to my dates", "Добавить в сроки"),
  uebernommen: tx("In Ihren Terminen gespeichert.", "Saved to your dates.", "Сохранено в сроках."),
  woerter: tx("Wörter erklärt", "Words explained", "Объяснение терминов"),
  antworten: tx("Antwort vorbereiten", "Prepare a reply", "Подготовить ответ"),
  antwortenText: tx(
    "Briefe an Ämter sind auf Deutsch. Wir füllen Ihren Namen und das Zeichen ein. Ergänzen Sie die Stellen in eckigen Klammern.",
    "Letters to offices are in German. We fill in your name and reference. Complete the parts in square brackets.",
    "Письма в ведомства пишутся по-немецки. Мы подставим ваше имя и номер дела. Дополните места в квадратных скобках.",
  ),
  betreff: tx("Betreff", "Subject", "Тема"),
  brieftext: tx("Brieftext", "Letter text", "Текст письма"),
  pdf: tx("Als PDF zum Ausdrucken", "PDF to print", "PDF для печати"),
  kopieren: tx("Text kopieren", "Copy text", "Скопировать текст"),
  kopiert: tx("Kopiert.", "Copied.", "Скопировано."),
  hilfe: tx(
    "Bei Widerspruch, Rückforderung oder Pfändung lohnt sich eine kostenlose Beratung.",
    "For objections, repayment demands or garnishment, free advice is worthwhile.",
    "При возражении, требовании вернуть деньги или взыскании стоит получить бесплатную консультацию.",
  ),
  hilfeLink: tx("Beratungsstellen", "Advice centres", "Консультации"),
  vorsicht: tx(
    "Die Erkennung arbeitet mit Schlüsselwörtern und kann sich irren. Maßgeblich ist immer der Brief selbst.",
    "Detection works with keywords and can be wrong. The letter itself is always what counts.",
    "Распознавание работает по ключевым словам и может ошибаться. Решающее значение всегда имеет само письмо.",
  ),
};

export function BriefSeite() {
  const { t } = useSprache();
  const { datum, lang, relativ } = useDatumFormat();
  const { daten, aendere } = useDaten();
  const [text, setText] = useState("");
  const [briefdatum, setBriefdatum] = useState("");
  const [erhalten, setErhalten] = useState("");
  const [fehler, setFehler] = useState("");
  const [analyse, setAnalyse] = useState<Analyse | null>(null);
  const [uebernommen, setUebernommen] = useState<string[]>([]);
  const [entwurf, setEntwurf] = useState<{ id: string; betreff: string; text: string } | null>(null);
  const [meldung, setMeldung] = useState("");
  const ergebnisRef = useRef<HTMLDivElement>(null);
  const titelRef = useRef<HTMLHeadingElement>(null);

  const erklaeren = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return setFehler(t(T.leer));
    setFehler("");
    const bd = lies(normalisiereDatum(briefdatum)) ?? undefined;
    const er = lies(normalisiereDatum(erhalten)) ?? undefined;
    const a = analysiere(text, { briefdatum: bd, erhalten: er });
    if (!briefdatum && a.briefdatum) setBriefdatum(alsText(a.briefdatum));
    setAnalyse(a);
    setUebernommen([]);
    setEntwurf(null);
    setTimeout(() => titelRef.current?.focus(), 0);
  };

  const zeichen = { datum: analyse?.briefdatum ? alsText(analyse.briefdatum) : undefined, aktenzeichen: analyse?.aktenzeichen };

  const brief = (): Brief => ({
    absender: [name(daten.profil) || "[Ihr Name]", ...(adresszeilen(daten.profil).length ? adresszeilen(daten.profil) : ["[Ihre Anschrift]"])],
    empfaenger: [analyse?.absender?.de ?? "[Behörde]", "[Anschrift der Behörde]"],
    ortDatum: `Berlin, ${alsText(heute())}`,
    betreff: entwurf!.betreff,
    text: entwurf!.text,
    name: name(daten.profil) || "[Ihr Name]",
  });

  return (
    <section className="seite">
      <h1 tabIndex={-1}>{t(T.titel)}</h1>
      <p className="einleitung">{t(T.einleitung)}</p>
      <p className="hilfe">{t(T.fotoTipp)}</p>

      <form noValidate onSubmit={erklaeren} className="schritt">
        <div className={fehler ? "feld feld-fehler" : "feld"}>
          <label htmlFor="brief-text">{t(T.text)}</label>
          {fehler && (
            <p className="fehler" id="brief-fehler">
              <span aria-hidden="true">! </span>
              {fehler}
            </p>
          )}
          <textarea
            id="brief-text"
            rows={10}
            value={text}
            lang="de"
            aria-invalid={fehler ? true : undefined}
            aria-describedby={fehler ? "brief-fehler" : undefined}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="button" className="knopf-klein" onClick={() => (setText(BEISPIEL), setBriefdatum(""), setErhalten(""))}>
            {t(T.beispiel)}
          </button>
        </div>
        <div className="zeile-felder">
          <FrageFeld frage={{ id: "briefdatum", typ: "datum", frage: T.briefdatum, hilfe: T.briefdatumHilfe }} wert={briefdatum} onChange={setBriefdatum} />
          <FrageFeld frage={{ id: "erhalten", typ: "datum", frage: T.erhalten, hilfe: T.erhaltenHilfe }} wert={erhalten} onChange={setErhalten} />
        </div>
        <button type="submit" className="knopf">
          {t(T.erklaeren)}
        </button>
      </form>

      {analyse && (
        <section className="brief-ergebnis" aria-labelledby="brief-ergebnis">
          <div className="plan-kopf">
            <h2 id="brief-ergebnis" ref={titelRef} tabIndex={-1}>
              {t(T.ergebnis)}
            </h2>
            <div className="werkzeugleiste">
              <Vorlesen ziel={ergebnisRef} />
            </div>
          </div>
          <div ref={ergebnisRef}>
            <dl className="eckdaten">
              <div>
                <dt>{t(T.absender)}</dt>
                <dd>{analyse.absender ? t(analyse.absender) : t(T.unbekannt)}</dd>
              </div>
              {analyse.briefdatum && (
                <div>
                  <dt>{t(T.briefdatum)}</dt>
                  <dd>{datum(analyse.briefdatum)}</dd>
                </div>
              )}
              {analyse.aktenzeichen && (
                <div>
                  <dt>{t(T.aktenzeichen)}</dt>
                  <dd>{analyse.aktenzeichen}</dd>
                </div>
              )}
              {analyse.betraege.length > 0 && (
                <div>
                  <dt>{t(T.betraege)}</dt>
                  <dd>{analyse.betraege.join(", ")}</dd>
                </div>
              )}
            </dl>

            {analyse.arten.length === 0 && <p className="hinweis">{t(T.keineArt)}</p>}
            {analyse.arten.map((a) => (
              <div key={a.id} className="brief-art">
                <h3>{t(a.titel)}</h3>
                <p>{t(a.erklaerung)}</p>
                <h4>{t(T.tun)}</h4>
                <ul className="haken">
                  {a.tun.map((x, i) => (
                    <li key={i}>{t(x)}</li>
                  ))}
                </ul>
              </div>
            ))}

            <h3>{t(T.fristen)}</h3>
            {analyse.fristen.length === 0 ? (
              <p>{t(T.keineFrist)}</p>
            ) : (
              <ul className="terminliste">
                {analyse.fristen.map((f, i) => {
                  const key = `${f.art}-${f.datum.getTime()}`;
                  return (
                    <li key={i} className={f.art === "widerspruch" || f.art === "klage" || f.art === "bis" ? "termin frist-gelb" : "termin"}>
                      <div className="termin-datum">
                        <span className="termin-art">{t(f.titel)}</span>
                        <strong>{lang(f.datum)}</strong>
                        {f.uhrzeit && <span>, {f.uhrzeit}</span>}
                        <span className="relativ"> · {relativ(f.datum)}</span>
                      </div>
                      <p className="klein zitat" lang="de">
                        {f.stelle}
                      </p>
                      {(f.art === "widerspruch" || f.art === "klage" || f.art === "relativ") && analyse.zugang && <p className="klein">{t(T.zugang(datum(analyse.zugang)))}</p>}
                      {f.verschoben && <p className="klein">{t(T.verschoben)}</p>}
                      <button
                        type="button"
                        className="knopf-klein"
                        disabled={uebernommen.includes(key)}
                        onClick={() => {
                          aendere((d) => ({
                            ...d,
                            termine: [
                              ...d.termine,
                              {
                                id: neueId(),
                                titel: `${t(f.titel)}${analyse.absender ? ` (${t(analyse.absender)})` : ""}`,
                                datum: alsText(f.datum),
                                uhrzeit: f.uhrzeit,
                                notiz: analyse.aktenzeichen ? `${t(T.aktenzeichen)}: ${analyse.aktenzeichen}` : undefined,
                              },
                            ],
                          }));
                          setUebernommen((u) => [...u, key]);
                        }}
                      >
                        {t(uebernommen.includes(key) ? T.uebernommen : T.uebernehmen)}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {analyse.woerter.length > 0 && (
              <>
                <h3>{t(T.woerter)}</h3>
                <dl className="glossar">
                  {analyse.woerter.map((w) => (
                    <div key={w.wort}>
                      <dt lang="de">{w.wort}</dt>
                      <dd>{t(w.erklaerung)}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </div>

          <section className="schritt" aria-labelledby="antwort-titel">
            <h3 id="antwort-titel">{t(T.antworten)}</h3>
            <p>{t(T.antwortenText)}</p>
            <div className="halt-aktionen">
              {vorlagen
                .filter(
                  (v) =>
                    analyse.arten.length === 0 ||
                    analyse.arten.some((a) => a.vorlagen?.includes(v.id)) ||
                    v.id === "frist" ||
                    (v.id === "widerspruch" && analyse.fristen.some((f) => f.art === "widerspruch")),
                )
                .map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className="knopf-zweit knopf-mittel"
                    aria-pressed={entwurf?.id === v.id}
                    onClick={() => setEntwurf({ id: v.id, betreff: v.betreff(zeichen), text: v.text(zeichen) })}
                  >
                    {t(v.name)}
                  </button>
                ))}
            </div>
            {entwurf && (
              <div className="entwurf">
                <div className="feld">
                  <label htmlFor="entwurf-betreff">{t(T.betreff)}</label>
                  <input id="entwurf-betreff" type="text" lang="de" value={entwurf.betreff} onChange={(e) => setEntwurf({ ...entwurf, betreff: e.target.value })} />
                </div>
                <div className="feld">
                  <label htmlFor="entwurf-text">{t(T.brieftext)}</label>
                  <textarea id="entwurf-text" lang="de" rows={8} value={entwurf.text} onChange={(e) => setEntwurf({ ...entwurf, text: e.target.value })} />
                </div>
                <div className="aktionen">
                  <button
                    type="button"
                    className="knopf"
                    onClick={async () => {
                      const w = await ladePdfWerkzeug();
                      ladeHerunter(await w.erzeugeBriefe([brief()], w.schriften, entwurf.betreff), `brief-${entwurf.id}.pdf`, "application/pdf");
                    }}
                  >
                    {t(T.pdf)}
                  </button>
                  <button
                    type="button"
                    className="knopf-zweit"
                    onClick={async () => {
                      const w = await import("../lib/briefPdf");
                      if (await kopiere(w.briefAlsText(brief()))) setMeldung(t(T.kopiert));
                    }}
                  >
                    {t(T.kopieren)}
                  </button>
                </div>
                <p role="status" className="status-zeile">
                  {meldung}
                </p>
              </div>
            )}
          </section>
          <p>
            {t(T.hilfe)} <a href={link("/hilfe")}>{t(T.hilfeLink)}</a>
          </p>
          <p className="hinweis">{t(T.vorsicht)}</p>
        </section>
      )}
    </section>
  );
}
