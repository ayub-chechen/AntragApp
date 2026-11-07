import type { Feld } from "../antraege/typen";

interface Props {
  feld: Feld;
  wert: string;
  fehler?: string;
  hinweis?: string | null;
  onChange: (wert: string) => void;
  onBlur: () => void;
}

export function FeldEingabe({ feld, wert, fehler, hinweis, onChange, onBlur }: Props) {
  const id = `feld-${feld.name}`;
  const hilfeId = feld.hilfetext ? `${id}-hilfe` : undefined;
  const fehlerId = fehler ? `${id}-fehler` : undefined;
  const hinweisId = hinweis ? `${id}-hinweis` : undefined;
  const beschrieben = [hilfeId, fehlerId, hinweisId].filter(Boolean).join(" ") || undefined;
  const zusatz = feld.pflicht ? null : <span className="optional"> (freiwillig)</span>;

  const unterzeilen = (
    <>
      {feld.hilfetext && (
        <p id={hilfeId} className="hilfe">
          {feld.hilfetext}
        </p>
      )}
      {fehler && (
        <p id={fehlerId} className="fehler">
          <span aria-hidden="true">! </span>
          {fehler}
        </p>
      )}
      {hinweis && (
        <p id={hinweisId} className="frist" role="status">
          {hinweis}
        </p>
      )}
    </>
  );

  if (feld.typ === "radio") {
    return (
      <fieldset className={fehler ? "feld feld-fehler" : "feld"} id={id} tabIndex={-1} aria-describedby={beschrieben}>
        <legend>
          {feld.label}
          {zusatz}
        </legend>
        {unterzeilen}
        <div className="radios">
          {feld.optionen!.map((o) => (
            <label key={o.wert} className="radio">
              <input
                type="radio"
                name={feld.name}
                value={o.wert}
                checked={wert === o.wert}
                required={feld.pflicht}
                aria-invalid={fehler ? true : undefined}
                onChange={() => onChange(o.wert)}
                onBlur={onBlur}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  const gemeinsam = {
    id,
    name: feld.name,
    value: wert,
    required: feld.pflicht,
    "aria-invalid": fehler ? true : undefined,
    "aria-describedby": beschrieben,
    autoComplete: feld.autocomplete ?? "off",
    onBlur,
  } as const;

  return (
    <div className={fehler ? "feld feld-fehler" : "feld"}>
      <label htmlFor={id}>
        {feld.label}
        {zusatz}
      </label>
      {unterzeilen}
      {feld.typ === "auswahl" ? (
        <select {...gemeinsam} onChange={(e) => onChange(e.target.value)}>
          <option value="">Bitte wählen</option>
          {feld.optionen!.map((o) => (
            <option key={o.wert} value={o.wert}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...gemeinsam}
          type="text"
          className={feld.typ === "plz" ? "kurz" : feld.typ === "datum" ? "mittel" : undefined}
          inputMode={feld.typ === "plz" || feld.typ === "datum" ? "numeric" : undefined}
          maxLength={feld.typ === "plz" ? 5 : feld.typ === "datum" ? 10 : 200}
          placeholder={feld.typ === "datum" ? "TT.MM.JJJJ" : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
