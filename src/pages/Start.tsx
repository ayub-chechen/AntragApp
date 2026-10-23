import { findeAntrag, lebenslagen } from "../antraege";
import { link } from "../lib/router";

export function Start() {
  return (
    <section className="seite start">
      <h1 tabIndex={-1} className="start-titel">
        Was steht bei Ihnen an?
      </h1>
      <p className="einleitung">
        Wählen Sie Ihre Situation. Wir fragen Schritt für Schritt alles ab, was das Amt wissen
        möchte, und Sie bekommen Ihre Angaben als PDF. Ihre Daten bleiben auf Ihrem Gerät.
      </p>
      <ul className="lagen">
        {lebenslagen.map((lage) => {
          const antrag = lage.antraege.map(findeAntrag)[0];
          return (
            <li key={lage.id} className={antrag ? "lage" : "lage lage-bald"}>
              {antrag ? (
                <a href={link(`/antrag/${antrag.id}`)}>
                  <span className="lage-titel">{lage.titel}</span>
                  <span className="lage-text">{antrag.titel}</span>
                </a>
              ) : (
                <div>
                  <span className="lage-titel">{lage.titel}</span>
                  <span className="lage-text">{lage.beschreibung}. Kommt bald.</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
