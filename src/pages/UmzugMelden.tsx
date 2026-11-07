import { useState } from "react";
import { FrageFeld } from "../components/FrageFeld";
import { ui } from "../i18n/ui";
import { tx, useSprache, type Tx } from "../i18n/sprache";
import { LINKS } from "../inhalte/links";
import { name as profilName } from "../inhalte/profil";
import type { Brief } from "../lib/briefPdf";
import { useDaten } from "../lib/daten";
import { alsText, heute, lies } from "../lib/datum";
import { kopiere, ladeHerunter, ladePdfWerkzeug } from "../lib/download";
import { normalisiereDatum } from "../lib/validierung";

interface Stelle {
  id: string;
  name: Tx;
  amtlich: string;
  nummer: string;
  profil?: string;
  meldebescheinigung?: boolean;
}

const STELLEN: Stelle[] = [
  { id: "familienkasse", name: tx("Familienkasse", "Family benefits office", "Familienkasse"), amtlich: "Familienkasse", nummer: "Kindergeldnummer", profil: "nummer.kindergeld", meldebescheinigung: true },
  { id: "jobcenter", name: tx("Jobcenter", "Jobcenter", "Jobcenter"), amtlich: "Jobcenter", nummer: "Nummer der Bedarfsgemeinschaft", profil: "nummer.bg", meldebescheinigung: true },
  { id: "bafoeg", name: tx("BAföG-Amt", "BAföG office", "Ведомство BAföG"), amtlich: "Amt für Ausbildungsförderung", nummer: "Förderungsnummer", meldebescheinigung: true },
  { id: "wohngeld", name: tx("Wohngeldstelle", "Housing benefit office", "Wohngeldstelle"), amtlich: "Wohngeldstelle", nummer: "Aktenzeichen", meldebescheinigung: true },
  { id: "elterngeld", name: tx("Elterngeldstelle", "Parental allowance office", "Elterngeldstelle"), amtlich: "Elterngeldstelle", nummer: "Aktenzeichen" },
  { id: "krankenkasse", name: tx("Krankenkasse", "Health insurer", "Больничная касса"), amtlich: "Krankenkasse", nummer: "Versichertennummer", profil: "nummer.versichert" },
  { id: "rente", name: tx("Rentenversicherung", "Pension insurance", "Пенсионное страхование"), amtlich: "Deutsche Rentenversicherung", nummer: "Versicherungsnummer", profil: "nummer.rente" },
  { id: "arbeitgeber", name: tx("Arbeitgeber", "Employer", "Работодатель"), amtlich: "Personalabteilung", nummer: "Personalnummer" },
  { id: "bank", name: tx("Bank", "Bank", "Банк"), amtlich: "Bank", nummer: "IBAN oder Kundennummer" },
  { id: "versicherung", name: tx("Versicherung", "Insurance", "Страховая"), amtlich: "Versicherung", nummer: "Versicherungsscheinnummer" },
  { id: "energie", name: tx("Strom oder Gas", "Electricity or gas", "Электричество или газ"), amtlich: "Energieversorger", nummer: "Kundennummer" },
  { id: "telefon", name: tx("Handy oder Internet", "Mobile or internet", "Мобильная связь или интернет"), amtlich: "Telefonanbieter", nummer: "Kundennummer" },
];

const T = {
  titel: tx("Umzug melden", "Report your move", "Сообщить о переезде"),
  einleitung: tx(
    "Einmal die neue Adresse eingeben, dann schreibt der Antragslotse für jede Stelle einen fertigen Brief. Ausdrucken, unterschreiben, abschicken, oder den Text in ein Online-Formular kopieren.",
    "Enter your new address once and the Antragslotse writes a finished letter for each organisation. Print, sign, send, or copy the text into an online form.",
    "Введите новый адрес один раз — и Antragslotse напишет готовое письмо для каждой организации. Распечатайте, подпишите, отправьте или скопируйте текст в онлайн-форму.",
  ),
  wichtig: tx(
    "Bekommen Sie Grundsicherungsgeld? Holen Sie vor dem Umzug die Zusicherung des Jobcenters. Den Rundfunkbeitrag ändern Sie am schnellsten online, einen Nachsendeauftrag gibt es bei der Deutschen Post.",
    "Receiving basic income support? Get the Jobcenter's approval before moving. The broadcasting fee is quickest to change online; mail forwarding is available from Deutsche Post.",
    "Получаете Grundsicherungsgeld? До переезда получите согласие Jobcenter. Взнос за ТВ проще всего изменить онлайн, пересылку почты оформляет Deutsche Post.",
  ),
  rundfunk: tx("Rundfunkbeitrag online ändern", "Change broadcasting fee online", "Изменить взнос за ТВ онлайн"),
  sie: tx("Ihre Angaben", "Your details", "Ваши данные"),
  name: tx("Ihr Name", "Your name", "Ваше имя"),
  datum: tx("Umzugsdatum", "Moving date", "Дата переезда"),
  alt: tx("Bisherige Adresse", "Previous address", "Прежний адрес"),
  neu: tx("Neue Adresse", "New address", "Новый адрес"),
  adresseHilfe: tx("Straße und Hausnummer, PLZ und Ort", "Street and number, postcode and town", "Улица и дом, индекс и город"),
  stellen: tx("An wen soll ein Brief gehen?", "Who should get a letter?", "Кому отправить письмо?"),
  anschrift: tx("Anschrift der Stelle", "Address of the organisation", "Адрес организации"),
  anschriftHilfe: tx("Steht auf deren Briefen. Sonst später von Hand eintragen.", "It's on their letters. Otherwise fill in by hand later.", "Указан на их письмах. Иначе впишите потом от руки."),
  nummer: tx("Ihre Nummer dort", "Your number there", "Ваш номер там"),
  erstellen: tx("Alle Briefe als PDF", "All letters as PDF", "Все письма в PDF"),
  laeuft: tx("PDF wird erstellt …", "Creating PDF …", "Создаём PDF …"),
  fertig: tx("PDF heruntergeladen.", "PDF downloaded.", "PDF скачан."),
  kopieren: tx("Text kopieren", "Copy text", "Скопировать текст"),
  kopiert: tx("Text kopiert.", "Text copied.", "Текст скопирован."),
  fehlt: tx("Bitte Name, Datum, beide Adressen und mindestens eine Stelle angeben.", "Please give your name, date, both addresses and at least one organisation.", "Укажите имя, дату, оба адреса и хотя бы одну организацию."),
  insProfil: tx("Neue Adresse in mein Profil übernehmen", "Save new address to my profile", "Сохранить новый адрес в профиль"),
  imProfil: tx("Im Profil gespeichert.", "Saved to profile.", "Сохранено в профиле."),
};

function zeilen(text: string): string[] {
  return text
    .split(/\n|,(?=\s*\d{5})/)
    .map((z) => z.trim())
    .filter(Boolean);
}

export function UmzugMelden() {
  const { t, sprache } = useSprache();
  const { daten, aendere } = useDaten();
  const p = daten.profil;
  const profilAdresse = [[p["adresse.strasse"], p["adresse.hausnummer"]].filter(Boolean).join(" "), [p["adresse.plz"], p["adresse.ort"]].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join("\n");
  const [form, setForm] = useState({ name: profilName(p), datum: "", alt: "", neu: profilAdresse });
  const [gewaehlt, setGewaehlt] = useState<Record<string, { anschrift: string; nummer: string }>>({});
  const [status, setStatus] = useState("");
  const [fehler, setFehler] = useState("");

  const umschalten = (s: Stelle) =>
    setGewaehlt((g) => {
      if (g[s.id]) {
        const { [s.id]: _, ...rest } = g;
        return rest;
      }
      return { ...g, [s.id]: { anschrift: "", nummer: s.profil ? (p[s.profil] ?? "") : "" } };
    });

  const briefe = (): Brief[] | null => {
    const d = lies(normalisiereDatum(form.datum));
    if (!form.name.trim() || !d || !form.alt.trim() || !form.neu.trim() || !Object.keys(gewaehlt).length) return null;
    const neu = zeilen(form.neu);
    return STELLEN.filter((s) => gewaehlt[s.id]).map((s) => {
      const g = gewaehlt[s.id];
      return {
        absender: [form.name.trim(), ...neu],
        empfaenger: [s.amtlich, ...zeilen(g.anschrift)],
        ortDatum: `Berlin, ${alsText(heute())}`,
        betreff: `Mitteilung meiner neuen Anschrift${g.nummer.trim() ? ` – ${s.nummer}: ${g.nummer.trim()}` : ""}`,
        text:
          `ich bin am ${alsText(d)} umgezogen. Bitte ändern Sie meine Anschrift in Ihren Unterlagen.\n\n` +
          `Bisherige Anschrift:\n${zeilen(form.alt).join("\n")}\n\nNeue Anschrift:\n${neu.join("\n")}` +
          (s.meldebescheinigung ? "\n\nEine Kopie der Meldebescheinigung lege ich bei." : ""),
        name: form.name.trim(),
        anlagen: s.meldebescheinigung ? ["Kopie der Meldebescheinigung"] : undefined,
      };
    });
  };

  const pdf = async () => {
    const liste = briefe();
    if (!liste) return setFehler(t(T.fehlt));
    setFehler("");
    setStatus(t(T.laeuft));
    const w = await ladePdfWerkzeug();
    ladeHerunter(await w.erzeugeBriefe(liste, w.schriften, "Mitteilung der neuen Anschrift"), "umzug-briefe.pdf", "application/pdf");
    setStatus(t(T.fertig));
  };

  return (
    <section className="seite">
      <h1 tabIndex={-1}>{t(T.titel)}</h1>
      <p className="einleitung">{t(T.einleitung)}</p>
      <p className="hinweis">
        {t(T.wichtig)}{" "}
        <a href={LINKS.rundfunk} target="_blank" rel="noopener noreferrer">
          {t(T.rundfunk)}
          <span className="sr"> {t(ui.neuerTab)}</span>
        </a>
      </p>
      {ui.formularDeutsch[sprache] && <p className="klein-hinweis">{t(ui.formularDeutsch)}</p>}

      <div className="schritt">
        <h2>{t(T.sie)}</h2>
        <FrageFeld frage={{ id: "u_name", typ: "text", pflicht: true, frage: T.name }} wert={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <FrageFeld frage={{ id: "u_datum", typ: "datum", pflicht: true, frage: T.datum }} wert={form.datum} onChange={(v) => setForm({ ...form, datum: v })} />
        <div className="zeile-felder">
          <div className="feld">
            <label htmlFor="u_alt">{t(T.alt)}</label>
            <p className="hilfe" id="u_alt_hilfe">
              {t(T.adresseHilfe)}
            </p>
            <textarea id="u_alt" rows={2} aria-describedby="u_alt_hilfe" value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} />
          </div>
          <div className="feld">
            <label htmlFor="u_neu">{t(T.neu)}</label>
            <p className="hilfe" id="u_neu_hilfe">
              {t(T.adresseHilfe)}
            </p>
            <textarea id="u_neu" rows={2} aria-describedby="u_neu_hilfe" value={form.neu} onChange={(e) => setForm({ ...form, neu: e.target.value })} />
          </div>
        </div>
        <button
          type="button"
          className="knopf-klein"
          onClick={() => {
            const [strasseZeile = "", ortZeile = ""] = zeilen(form.neu);
            const s = /^(.*?)\s+(\d+\s?\w?)$/.exec(strasseZeile);
            const o = /^(\d{5})\s+(.*)$/.exec(ortZeile);
            aendere((d) => ({
              ...d,
              profil: {
                ...d.profil,
                "adresse.strasse": s?.[1] ?? strasseZeile,
                "adresse.hausnummer": s?.[2] ?? "",
                "adresse.plz": o?.[1] ?? "",
                "adresse.ort": o?.[2] ?? ortZeile,
              },
            }));
            setStatus(t(T.imProfil));
          }}
        >
          {t(T.insProfil)}
        </button>

        <fieldset className="feld">
          <legend>{t(T.stellen)}</legend>
          <div className="radios radios-raster">
            {STELLEN.map((s) => (
              <label key={s.id} className="radio">
                <input type="checkbox" checked={!!gewaehlt[s.id]} onChange={() => umschalten(s)} />
                <span>{t(s.name)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {STELLEN.filter((s) => gewaehlt[s.id]).map((s) => (
          <fieldset key={s.id} className="stelle">
            <legend>{t(s.name)}</legend>
            <div className="feld">
              <label htmlFor={`a-${s.id}`}>{t(T.anschrift)}</label>
              <p className="hilfe" id={`a-${s.id}-hilfe`}>
                {t(T.anschriftHilfe)}
              </p>
              <textarea
                id={`a-${s.id}`}
                rows={2}
                aria-describedby={`a-${s.id}-hilfe`}
                value={gewaehlt[s.id].anschrift}
                onChange={(e) => setGewaehlt({ ...gewaehlt, [s.id]: { ...gewaehlt[s.id], anschrift: e.target.value } })}
              />
            </div>
            <div className="feld">
              <label htmlFor={`n-${s.id}`}>
                {t(T.nummer)} <span lang="de">({s.nummer})</span>
              </label>
              <input
                id={`n-${s.id}`}
                type="text"
                value={gewaehlt[s.id].nummer}
                onChange={(e) => setGewaehlt({ ...gewaehlt, [s.id]: { ...gewaehlt[s.id], nummer: e.target.value } })}
              />
            </div>
            <button
              type="button"
              className="knopf-klein"
              onClick={async () => {
                const liste = briefe();
                if (!liste) return setFehler(t(T.fehlt));
                const i = STELLEN.filter((x) => gewaehlt[x.id]).findIndex((x) => x.id === s.id);
                const { briefAlsText } = await import("../lib/briefPdf");
                if (await kopiere(briefAlsText(liste[i]))) setStatus(t(T.kopiert));
              }}
            >
              {t(T.kopieren)}
              <span className="sr">: {t(s.name)}</span>
            </button>
          </fieldset>
        ))}

        {fehler && (
          <p className="fehler" role="alert">
            {fehler}
          </p>
        )}
        <div className="aktionen">
          <button type="button" className="knopf" onClick={pdf}>
            {t(T.erstellen)}
          </button>
        </div>
        <p role="status" className="status-zeile">
          {status}
        </p>
      </div>
    </section>
  );
}
