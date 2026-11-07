import { useRef, useState } from "react";
import { FrageFeld } from "../components/FrageFeld";
import { useDatumFormat } from "../components/FristText";
import { ui } from "../i18n/ui";
import { tx, useSprache } from "../i18n/sprache";
import { dokArten, profilGruppen } from "../inhalte/profil";
import type { DokArt } from "../inhalte/typen";
import { neueId, useDaten, type Dokument } from "../lib/daten";
import { alsIso, heute, lies } from "../lib/datum";
import { ladeHerunter } from "../lib/download";
import { link } from "../lib/router";
import { normalisiereDatum } from "../lib/validierung";

const MAX_DATEI = 8 * 1024 * 1024;

const T = {
  titel: tx("Mein Bereich", "My space", "Мои данные"),
  einleitung: tx(
    "Ihr Profil, Ihr Unterlagen-Ordner und Ihre Sicherung. Einmal eingeben, immer wieder nutzen: Die Angaben füllen Formulare und Briefe vor.",
    "Your profile, your document folder and your backup. Enter once, reuse again and again: the information pre-fills forms and letters.",
    "Ваш профиль, папка документов и резервная копия. Введите один раз и пользуйтесь постоянно: данные подставляются в бланки и письма.",
  ),
  laedt: tx("Einen Moment …", "One moment …", "Минутку …"),
  tabs: tx("Bereiche", "Sections", "Разделы"),
  profil: tx("Profil", "Profile", "Профиль"),
  unterlagen: tx("Unterlagen-Ordner", "Document folder", "Папка документов"),
  sicherung: tx("Sicherung und PIN", "Backup and PIN", "Резервная копия и PIN"),
  tresorTitel: tx("Dauerhaft und verschlüsselt speichern", "Save permanently and encrypted", "Сохранять надолго и в зашифрованном виде"),
  tresorText: tx(
    "Legen Sie eine PIN oder ein Passwort fest. Damit werden Ihre Angaben verschlüsselt auf diesem Gerät gespeichert. Niemand außer Ihnen kann sie lesen, auch wir nicht. Vergessen Sie die PIN, sind die Daten verloren.",
    "Choose a PIN or password. Your information will then be stored encrypted on this device. Nobody but you can read it, not even us. If you forget the PIN, the data is lost.",
    "Задайте PIN-код или пароль. Тогда ваши данные будут храниться на этом устройстве в зашифрованном виде. Никто, кроме вас, не сможет их прочитать, даже мы. Если забудете PIN, данные будут потеряны.",
  ),
  pin: tx("PIN oder Passwort", "PIN or password", "PIN-код или пароль"),
  pinHilfe: tx("Mindestens 6 Zeichen. Länger ist sicherer, z. B. ein kurzer Satz.", "At least 6 characters. Longer is safer, e.g. a short sentence.", "Не менее 6 символов. Чем длиннее, тем надёжнее, например короткая фраза."),
  pinWdh: tx("PIN wiederholen", "Repeat PIN", "Повторите PIN"),
  pinKurz: tx("Bitte mindestens 6 Zeichen.", "Please use at least 6 characters.", "Минимум 6 символов."),
  pinGleich: tx("Die beiden Eingaben sind nicht gleich.", "The two entries do not match.", "Введённые значения не совпадают."),
  pinFalsch: tx("Die PIN stimmt nicht.", "The PIN is not correct.", "Неверный PIN."),
  anlegen: tx("Verschlüsselt speichern", "Save encrypted", "Сохранить с шифрованием"),
  rechnet: tx("Wird verschlüsselt …", "Encrypting …", "Шифрование …"),
  gesperrt: tx("Ihre Angaben sind gesperrt", "Your information is locked", "Ваши данные заблокированы"),
  gesperrtText: tx("Geben Sie Ihre PIN ein, um sie zu öffnen.", "Enter your PIN to open it.", "Введите PIN, чтобы открыть."),
  vergessen: tx("PIN vergessen?", "Forgot your PIN?", "Забыли PIN?"),
  vergessenText: tx(
    "Ohne PIN lässt sich nichts entschlüsseln. Sie können alles löschen und neu beginnen, oder eine Sicherung mit ihrer PIN einspielen.",
    "Nothing can be decrypted without the PIN. You can delete everything and start again, or restore a backup with its PIN.",
    "Без PIN ничего расшифровать нельзя. Можно удалить всё и начать заново или восстановить резервную копию с её PIN.",
  ),
  allesLoeschen: tx("Alles auf diesem Gerät löschen", "Delete everything on this device", "Удалить всё на этом устройстве"),
  sicher: tx("Wirklich alles löschen? Klicken Sie zum Bestätigen noch einmal.", "Really delete everything? Click again to confirm.", "Точно удалить всё? Нажмите ещё раз для подтверждения."),
  offen: tx("Gespeichert und verschlüsselt auf diesem Gerät.", "Saved and encrypted on this device.", "Сохранено и зашифровано на этом устройстве."),
  sperren: tx("Jetzt sperren", "Lock now", "Заблокировать"),
  autoSperre: tx("Nach 15 Minuten ohne Bedienung wird automatisch gesperrt.", "Locks automatically after 15 minutes without use.", "Блокируется автоматически через 15 минут бездействия."),
  kinder: tx("Kinder", "Children", "Дети"),
  kindName: tx("Vorname des Kindes", "Child's first name", "Имя ребёнка"),
  kindGeburt: tx("Geburtsdatum", "Date of birth", "Дата рождения"),
  kindDazu: tx("Kind hinzufügen", "Add child", "Добавить ребёнка"),
  automatisch: tx("Änderungen werden sofort übernommen.", "Changes are applied immediately.", "Изменения применяются сразу."),
  ordnerText: tx(
    "Legen Sie wichtige Unterlagen ab, z. B. ein Foto Ihres Ausweises oder Bescheide. Ablaufdaten erscheinen bei Ihren Terminen. Der Fahrplan zeigt, was schon im Ordner liegt.",
    "Store important documents, e.g. a photo of your ID or official letters. Expiry dates appear in your dates. The roadmap shows what is already in the folder.",
    "Храните важные документы, например фото удостоверения или решения ведомств. Сроки действия появятся в ваших сроках. План покажет, что уже есть в папке.",
  ),
  neuDok: tx("Unterlage hinzufügen", "Add document", "Добавить документ"),
  dokTitel: tx("Bezeichnung, z. B. Personalausweis", "Name, e.g. ID card", "Название, например удостоверение личности"),
  dokArt: tx("Art", "Type", "Тип"),
  gueltig: tx("Gültig bis", "Valid until", "Действует до"),
  notiz: tx("Notiz", "Note", "Заметка"),
  datei: tx("Datei oder Foto (bis 8 MB)", "File or photo (up to 8 MB)", "Файл или фото (до 8 МБ)"),
  dateiGross: tx("Die Datei ist größer als 8 MB.", "The file is larger than 8 MB.", "Файл больше 8 МБ."),
  ablegen: tx("Im Ordner ablegen", "Store in folder", "Положить в папку"),
  ansehen: tx("Ansehen", "View", "Открыть"),
  leerOrdner: tx("Noch keine Unterlagen im Ordner.", "No documents in the folder yet.", "В папке пока нет документов."),
  sicherungTitel: tx("Sicherung", "Backup", "Резервная копия"),
  sicherungText: tx(
    "Laden Sie eine verschlüsselte Sicherungsdatei herunter, z. B. für ein neues Handy. Sie lässt sich nur mit Ihrer PIN öffnen.",
    "Download an encrypted backup file, e.g. for a new phone. It can only be opened with your PIN.",
    "Скачайте зашифрованный файл резервной копии, например для нового телефона. Открыть его можно только с вашим PIN.",
  ),
  herunterladen: tx("Sicherung herunterladen", "Download backup", "Скачать резервную копию"),
  einspielen: tx("Sicherung einspielen", "Restore backup", "Восстановить из копии"),
  einspielenText: tx(
    "Wählen Sie eine Sicherungsdatei und geben Sie die PIN ein, mit der sie erstellt wurde. Die Angaben auf diesem Gerät werden ersetzt.",
    "Choose a backup file and enter the PIN it was created with. The information on this device will be replaced.",
    "Выберите файл резервной копии и введите PIN, с которым она создана. Данные на этом устройстве будут заменены.",
  ),
  dateiWaehlen: tx("Sicherungsdatei", "Backup file", "Файл резервной копии"),
  dateiFalsch: tx("Das ist keine Sicherung des Antragslotsen.", "This is not an Antragslotse backup.", "Это не резервная копия Antragslotse."),
  eingespielt: tx("Sicherung eingespielt.", "Backup restored.", "Копия восстановлена."),
  pinAendern: tx("PIN ändern", "Change PIN", "Изменить PIN"),
  neuePin: tx("Neue PIN", "New PIN", "Новый PIN"),
  pinGeaendert: tx("PIN geändert.", "PIN changed.", "PIN изменён."),
  ohneTresor: tx(
    "Noch nicht gespeichert: Ihre Angaben gelten nur, solange dieses Fenster offen ist.",
    "Not saved yet: your information lasts only while this window is open.",
    "Пока не сохранено: данные есть только, пока открыто это окно.",
  ),
};

function PinFeld({ id, label, wert, setze, fehler, hilfe, neu }: { id: string; label: string; wert: string; setze: (v: string) => void; fehler?: string; hilfe?: string; neu?: boolean }) {
  return (
    <div className={fehler ? "feld feld-fehler" : "feld"}>
      <label htmlFor={id}>{label}</label>
      {hilfe && (
        <p className="hilfe" id={`${id}-hilfe`}>
          {hilfe}
        </p>
      )}
      {fehler && (
        <p className="fehler" id={`${id}-fehler`}>
          <span aria-hidden="true">! </span>
          {fehler}
        </p>
      )}
      <input
        id={id}
        type="password"
        className="mittel-breit"
        value={wert}
        autoComplete={neu ? "new-password" : "current-password"}
        aria-invalid={fehler ? true : undefined}
        aria-describedby={[hilfe && `${id}-hilfe`, fehler && `${id}-fehler`].filter(Boolean).join(" ") || undefined}
        onChange={(e) => setze(e.target.value)}
      />
    </div>
  );
}

function TresorAnlegen() {
  const { t } = useSprache();
  const { erstelle } = useDaten();
  const [pin, setPin] = useState("");
  const [wdh, setWdh] = useState("");
  const [fehler, setFehler] = useState<{ pin?: string; wdh?: string }>({});
  const [laeuft, setLaeuft] = useState(false);
  return (
    <section className="schritt tresor" aria-labelledby="tresor-titel">
      <h2 id="tresor-titel">{t(T.tresorTitel)}</h2>
      <p>{t(T.tresorText)}</p>
      <form
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          const f: typeof fehler = {};
          if (pin.length < 6) f.pin = t(T.pinKurz);
          else if (pin !== wdh) f.wdh = t(T.pinGleich);
          setFehler(f);
          if (Object.keys(f).length) return;
          setLaeuft(true);
          await erstelle(pin);
          setLaeuft(false);
        }}
      >
        <PinFeld id="pin-neu" label={t(T.pin)} hilfe={t(T.pinHilfe)} wert={pin} setze={setPin} fehler={fehler.pin} neu />
        <PinFeld id="pin-wdh" label={t(T.pinWdh)} wert={wdh} setze={setWdh} fehler={fehler.wdh} neu />
        <button type="submit" className="knopf" disabled={laeuft}>
          {t(laeuft ? T.rechnet : T.anlegen)}
        </button>
      </form>
    </section>
  );
}

function Entsperren() {
  const { t } = useSprache();
  const { entsperre, loescheAlles } = useDaten();
  const [pin, setPin] = useState("");
  const [fehler, setFehler] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const [bestaetigen, setBestaetigen] = useState(false);
  return (
    <>
      <section className="schritt tresor" aria-labelledby="gesperrt-titel">
        <h2 id="gesperrt-titel">{t(T.gesperrt)}</h2>
        <p>{t(T.gesperrtText)}</p>
        <form
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            setLaeuft(true);
            const ok = await entsperre(pin);
            setLaeuft(false);
            if (!ok) setFehler(t(T.pinFalsch));
          }}
        >
          <PinFeld id="pin-auf" label={t(T.pin)} wert={pin} setze={(v) => (setPin(v), setFehler(""))} fehler={fehler || undefined} />
          <button type="submit" className="knopf" disabled={laeuft}>
            {t(ui.entsperren)}
          </button>
        </form>
      </section>
      <details className="vergessen">
        <summary>{t(T.vergessen)}</summary>
        <p>{t(T.vergessenText)}</p>
        <button type="button" className="knopf-leise" onClick={() => (bestaetigen ? void loescheAlles() : setBestaetigen(true))}>
          {t(bestaetigen ? T.sicher : T.allesLoeschen)}
        </button>
        <Einspielen />
      </details>
    </>
  );
}

function Einspielen() {
  const { t } = useSprache();
  const { einspielen } = useDaten();
  const [text, setText] = useState("");
  const [pin, setPin] = useState("");
  const [meldung, setMeldung] = useState<{ fehler?: string; ok?: string }>({});
  return (
    <section aria-labelledby="einspielen-titel" className="unterblock">
      <h3 id="einspielen-titel">{t(T.einspielen)}</h3>
      <p>{t(T.einspielenText)}</p>
      <form
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          const r = await einspielen(text, pin);
          setMeldung(r === "ok" ? { ok: t(T.eingespielt) } : { fehler: t(r === "pin" ? T.pinFalsch : T.dateiFalsch) });
        }}
      >
        <div className="feld">
          <label htmlFor="sicherung-datei">{t(T.dateiWaehlen)}</label>
          <input id="sicherung-datei" type="file" accept=".json,application/json" onChange={async (e) => setText((await e.target.files?.[0]?.text()) ?? "")} />
        </div>
        <PinFeld id="pin-sicherung" label={t(T.pin)} wert={pin} setze={setPin} />
        <button type="submit" className="knopf-zweit" disabled={!text}>
          {t(T.einspielen)}
        </button>
        <p role="status" className={meldung.fehler ? "fehler" : "status-zeile"}>
          {meldung.fehler ?? meldung.ok}
        </p>
      </form>
    </section>
  );
}

function Profil() {
  const { t } = useSprache();
  const { daten, aendere } = useDaten();
  const [kind, setKind] = useState({ vorname: "", geburtsdatum: "" });
  const setze = (id: string, wert: string) => aendere((d) => ({ ...d, profil: { ...d.profil, [id]: wert } }));
  return (
    <>
      <p className="hilfe">{t(T.automatisch)}</p>
      {profilGruppen.map((g, i) => (
        <section key={i} className="fragen-gruppe" aria-labelledby={`profil-${i}`}>
          <h2 id={`profil-${i}`}>{t(g.titel)}</h2>
          {g.fragen.map((f) => (
            <FrageFeld key={f.id} frage={f} wert={daten.profil[f.id] ?? ""} onChange={(v) => setze(f.id, v)} freiwilligZeigen={false} />
          ))}
        </section>
      ))}
      <section className="fragen-gruppe" aria-labelledby="kinder-titel">
        <h2 id="kinder-titel">{t(T.kinder)}</h2>
        {daten.kinder.length > 0 && (
          <ul className="kinderliste">
            {daten.kinder.map((k) => (
              <li key={k.id}>
                <span>
                  {k.vorname || "—"}, {k.geburtsdatum}
                </span>
                <button type="button" className="knopf-leise" onClick={() => aendere((d) => ({ ...d, kinder: d.kinder.filter((x) => x.id !== k.id) }))}>
                  {t(ui.loeschen)}
                  <span className="sr">: {k.vorname}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="zeile-felder">
          <FrageFeld frage={{ id: "kind-name", typ: "text", frage: T.kindName }} wert={kind.vorname} onChange={(v) => setKind({ ...kind, vorname: v })} freiwilligZeigen={false} />
          <FrageFeld frage={{ id: "kind-geburt", typ: "datum", frage: T.kindGeburt }} wert={kind.geburtsdatum} onChange={(v) => setKind({ ...kind, geburtsdatum: v })} freiwilligZeigen={false} />
        </div>
        <button
          type="button"
          className="knopf-zweit"
          onClick={() => {
            const g = normalisiereDatum(kind.geburtsdatum);
            if (!lies(g)) return;
            aendere((d) => ({ ...d, kinder: [...d.kinder, { id: neueId(), vorname: kind.vorname.trim(), geburtsdatum: g }] }));
            setKind({ vorname: "", geburtsdatum: "" });
          }}
        >
          {t(T.kindDazu)}
        </button>
      </section>
    </>
  );
}

function dataUrlZuBlob(url: string): Blob {
  const [kopf, inhalt] = url.split(",");
  const typ = /data:([^;]+)/.exec(kopf)?.[1] ?? "application/octet-stream";
  return new Blob([Uint8Array.from(atob(inhalt), (c) => c.charCodeAt(0))], { type: typ });
}

function Unterlagen() {
  const { t } = useSprache();
  const { datum } = useDatumFormat();
  const { daten, aendere } = useDaten();
  const leer = { titel: "", art: "ausweis" as DokArt, gueltigBis: "", notiz: "" };
  const [neu, setNeu] = useState(leer);
  const [datei, setDatei] = useState<Dokument["datei"]>();
  const [fehler, setFehler] = useState<Record<string, string>>({});
  const dateiRef = useRef<HTMLInputElement>(null);

  const ansehen = (d: Dokument) => {
    if (!d.datei) return;
    const url = URL.createObjectURL(dataUrlZuBlob(d.datei.daten));
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <>
      <p>{t(T.ordnerText)}</p>
      {daten.dokumente.length === 0 ? (
        <p className="hinweis">{t(T.leerOrdner)}</p>
      ) : (
        <ul className="dokumente">
          {daten.dokumente.map((d) => {
            const ablauf = lies(d.gueltigBis);
            return (
              <li key={d.id} className="dokument">
                <div>
                  <strong>{d.titel}</strong>
                  <span className="klein"> · {t(dokArten[d.art])}</span>
                  {ablauf && (
                    <span className={ablauf < heute() ? "klein fehler-text" : "klein"}>
                      {" "}
                      · {t(T.gueltig)} {datum(ablauf)}
                    </span>
                  )}
                  {d.notiz && <p className="klein">{d.notiz}</p>}
                </div>
                <div className="halt-aktionen">
                  {d.datei && (
                    <>
                      <button type="button" className="knopf-klein" onClick={() => ansehen(d)}>
                        {t(T.ansehen)}
                        <span className="sr">: {d.titel}</span>
                      </button>
                      <button type="button" className="knopf-klein" onClick={() => ladeHerunter(bytesAus(d.datei!.daten), d.datei!.name, d.datei!.typ)}>
                        ⤓<span className="sr"> {d.datei.name}</span>
                      </button>
                    </>
                  )}
                  <button type="button" className="knopf-leise" onClick={() => aendere((x) => ({ ...x, dokumente: x.dokumente.filter((y) => y.id !== d.id) }))}>
                    {t(ui.loeschen)}
                    <span className="sr">: {d.titel}</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <section className="schritt" aria-labelledby="neu-dok">
        <h2 id="neu-dok">{t(T.neuDok)}</h2>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const f: Record<string, string> = {};
            const g = neu.gueltigBis ? normalisiereDatum(neu.gueltigBis) : "";
            if (!neu.titel.trim()) f.titel = t(ui.pflichtFehler);
            if (g && !lies(g)) f.gueltig = t(ui.datumFehler);
            setFehler(f);
            if (Object.keys(f).length) return;
            aendere((x) => ({
              ...x,
              dokumente: [
                ...x.dokumente,
                { id: neueId(), titel: neu.titel.trim(), art: neu.art, gueltigBis: g || undefined, notiz: neu.notiz.trim() || undefined, datei, hinzugefuegt: alsIso(heute()) },
              ],
            }));
            setNeu(leer);
            setDatei(undefined);
            if (dateiRef.current) dateiRef.current.value = "";
          }}
        >
          <FrageFeld frage={{ id: "dok-titel", typ: "text", pflicht: true, frage: T.dokTitel }} wert={neu.titel} fehler={fehler.titel} onChange={(v) => setNeu({ ...neu, titel: v })} />
          <div className="feld">
            <label htmlFor="dok-art">{t(T.dokArt)}</label>
            <select id="dok-art" value={neu.art} onChange={(e) => setNeu({ ...neu, art: e.target.value as DokArt })}>
              {Object.entries(dokArten).map(([wert, text]) => (
                <option key={wert} value={wert}>
                  {t(text)}
                </option>
              ))}
            </select>
          </div>
          <FrageFeld frage={{ id: "dok-gueltig", typ: "datum", frage: T.gueltig }} wert={neu.gueltigBis} fehler={fehler.gueltig} onChange={(v) => setNeu({ ...neu, gueltigBis: v })} />
          <FrageFeld frage={{ id: "dok-notiz", typ: "text", frage: T.notiz }} wert={neu.notiz} onChange={(v) => setNeu({ ...neu, notiz: v })} />
          <div className={fehler.datei ? "feld feld-fehler" : "feld"}>
            <label htmlFor="dok-datei">{t(T.datei)}</label>
            {fehler.datei && <p className="fehler">{fehler.datei}</p>}
            <input
              id="dok-datei"
              ref={dateiRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return setDatei(undefined);
                if (f.size > MAX_DATEI) {
                  setFehler({ ...fehler, datei: t(T.dateiGross) });
                  e.target.value = "";
                  return;
                }
                setFehler(({ datei: _, ...rest }) => rest);
                const leser = new FileReader();
                leser.onload = () => setDatei({ name: f.name, typ: f.type, groesse: f.size, daten: String(leser.result) });
                leser.readAsDataURL(f);
              }}
            />
          </div>
          <button type="submit" className="knopf">
            {t(T.ablegen)}
          </button>
        </form>
      </section>
    </>
  );
}

function bytesAus(dataUrl: string): Uint8Array {
  return Uint8Array.from(atob(dataUrl.split(",")[1]), (c) => c.charCodeAt(0));
}

function Sicherung() {
  const { t } = useSprache();
  const { sicherung, aenderePin, sperre, loescheAlles } = useDaten();
  const [neuePin, setNeuePin] = useState("");
  const [meldung, setMeldung] = useState("");
  const [fehler, setFehler] = useState("");
  const [bestaetigen, setBestaetigen] = useState(false);
  return (
    <>
      <section className="unterblock" aria-labelledby="sicherung-titel">
        <h2 id="sicherung-titel">{t(T.sicherungTitel)}</h2>
        <p>{t(T.sicherungText)}</p>
        <button type="button" className="knopf-zweit" onClick={async () => ladeHerunter(await sicherung(), `antragslotse-sicherung-${alsIso(heute())}.json`, "application/json")}>
          {t(T.herunterladen)}
        </button>
      </section>
      <Einspielen />
      <section className="unterblock" aria-labelledby="pin-titel">
        <h2 id="pin-titel">{t(T.pinAendern)}</h2>
        <form
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            if (neuePin.length < 6) return setFehler(t(T.pinKurz));
            setFehler("");
            await aenderePin(neuePin);
            setNeuePin("");
            setMeldung(t(T.pinGeaendert));
          }}
        >
          <PinFeld id="pin-aendern" label={t(T.neuePin)} hilfe={t(T.pinHilfe)} wert={neuePin} setze={setNeuePin} fehler={fehler || undefined} neu />
          <button type="submit" className="knopf-zweit">
            {t(T.pinAendern)}
          </button>
          <p role="status" className="status-zeile">
            {meldung}
          </p>
        </form>
      </section>
      <section className="unterblock">
        <button type="button" className="knopf-zweit" onClick={sperre}>
          {t(T.sperren)}
        </button>{" "}
        <button type="button" className="knopf-leise" onClick={() => (bestaetigen ? void loescheAlles() : setBestaetigen(true))}>
          {t(bestaetigen ? T.sicher : T.allesLoeschen)}
        </button>
      </section>
    </>
  );
}

export function MeinBereich({ bereich }: { bereich: string }) {
  const { t } = useSprache();
  const { status, sperre } = useDaten();
  const tabs = [
    { id: "profil", text: T.profil },
    { id: "unterlagen", text: T.unterlagen },
    ...(status === "offen" ? [{ id: "sicherung", text: T.sicherung }] : []),
  ];
  const aktiv = tabs.some((x) => x.id === bereich) ? bereich : "profil";

  return (
    <section className="seite">
      <h1 tabIndex={-1}>{t(T.titel)}</h1>
      <p className="einleitung">{t(T.einleitung)}</p>

      {status === "laedt" && <p>{t(T.laedt)}</p>}
      {status === "gesperrt" && <Entsperren />}
      {status === "keiner" && (
        <>
          <p className="hinweis">{t(T.ohneTresor)}</p>
          <TresorAnlegen />
        </>
      )}
      {status === "offen" && (
        <p className="erfolg">
          <span aria-hidden="true">✓ </span>
          {t(T.offen)} {t(T.autoSperre)}{" "}
          <button type="button" className="knopf-klein" onClick={sperre}>
            {t(T.sperren)}
          </button>
        </p>
      )}

      {(status === "offen" || status === "keiner") && (
        <>
          <nav className="reiter" aria-label={t(T.tabs)}>
            {tabs.map((x) => (
              <a key={x.id} href={link(`/mein/${x.id}`)} aria-current={aktiv === x.id ? "page" : undefined}>
                {t(x.text)}
              </a>
            ))}
          </nav>
          {aktiv === "profil" && <Profil />}
          {aktiv === "unterlagen" && <Unterlagen />}
          {aktiv === "sicherung" && status === "offen" && <Sicherung />}
          {status === "keiner" && (
            <details className="vergessen">
              <summary>{t(T.einspielen)}</summary>
              <Einspielen />
            </details>
          )}
        </>
      )}
    </section>
  );
}
