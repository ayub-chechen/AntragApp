import { ui } from "../i18n/ui";
import { useSprache } from "../i18n/sprache";
import type { Frage } from "../inhalte/typen";
import { normalisiereDatum } from "../lib/validierung";

interface Props {
  frage: Frage;
  wert: string;
  fehler?: string;
  onChange: (wert: string) => void;
  /** „(freiwillig)“ anzeigen; in reinen Eingabe-Bereichen wie dem Profil nicht nötig. */
  freiwilligZeigen?: boolean;
}

export function FrageFeld({ frage, wert, fehler, onChange, freiwilligZeigen = true }: Props) {
  const { t } = useSprache();
  const id = `frage-${frage.id}`;
  const hilfeText = frage.hilfe ? t(frage.hilfe) : frage.typ === "datum" ? t(ui.datumHilfe) : null;
  const hilfeId = hilfeText ? `${id}-hilfe` : undefined;
  const fehlerId = fehler ? `${id}-fehler` : undefined;
  const beschrieben = [hilfeId, fehlerId].filter(Boolean).join(" ") || undefined;
  const klasse = fehler ? "feld feld-fehler" : "feld";
  const zusatz = frage.pflicht || !freiwilligZeigen ? null : <span className="optional"> {t(ui.freiwillig)}</span>;

  const unten = (
    <>
      {hilfeText && (
        <p id={hilfeId} className="hilfe">
          {hilfeText}
        </p>
      )}
      {fehler && (
        <p id={fehlerId} className="fehler">
          <span aria-hidden="true">! </span>
          {fehler}
        </p>
      )}
    </>
  );

  if (frage.typ === "janein" || frage.typ === "auswahl") {
    const optionen = frage.typ === "janein" ? [{ wert: "ja", text: ui.ja }, { wert: "nein", text: ui.nein }] : frage.optionen!;
    return (
      <fieldset className={klasse} id={id} tabIndex={-1} aria-describedby={beschrieben}>
        <legend>
          {t(frage.frage)}
          {zusatz}
        </legend>
        {unten}
        <div className={frage.typ === "janein" ? "radios radios-zeile" : "radios"}>
          {optionen.map((o) => (
            <label key={o.wert} className="radio">
              <input type="radio" name={frage.id} value={o.wert} checked={wert === o.wert} onChange={() => onChange(o.wert)} />
              <span>{t(o.text)}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (frage.typ === "mehrfach") {
    const gewaehlt = new Set(wert.split(",").filter(Boolean));
    return (
      <fieldset className={klasse} id={id} tabIndex={-1} aria-describedby={beschrieben}>
        <legend>
          {t(frage.frage)}
          {zusatz}
        </legend>
        {unten}
        <div className="radios radios-raster">
          {frage.optionen!.map((o) => (
            <label key={o.wert} className="radio">
              <input
                type="checkbox"
                value={o.wert}
                checked={gewaehlt.has(o.wert)}
                onChange={(e) => {
                  const neu = new Set(gewaehlt);
                  if (e.target.checked) neu.add(o.wert);
                  else neu.delete(o.wert);
                  onChange([...neu].join(","));
                }}
              />
              <span>{t(o.text)}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <div className={klasse}>
      <label htmlFor={id}>
        {t(frage.frage)}
        {zusatz}
      </label>
      {unten}
      <input
        id={id}
        type="text"
        className={frage.typ === "datum" ? "mittel" : frage.typ === "zahl" ? "mittel" : undefined}
        inputMode={frage.typ === "zahl" ? "decimal" : frage.typ === "datum" ? "numeric" : undefined}
        value={wert}
        aria-invalid={fehler ? true : undefined}
        aria-describedby={beschrieben}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          if (frage.typ === "datum" && wert) {
            const neu = normalisiereDatum(wert);
            if (neu !== wert) onChange(neu);
          }
        }}
      />
    </div>
  );
}
