import type { Antrag } from "../antraege/typen";

export function Uebergabe({ antrag }: { antrag: Antrag }) {
  return (
    <section aria-labelledby="weiter-titel" className="uebergabe">
      <h2 id="weiter-titel">So reichen Sie den Antrag ein</h2>
      <ol className="weiter">
        <li>
          <strong>Termin buchen oder online anmelden.</strong> Auf der offiziellen Seite finden Sie die
          Terminbuchung im Bürgeramt und, wenn Sie einen Online-Ausweis haben, die elektronische
          Anmeldung.{" "}
          <a href={antrag.online_url ?? antrag.quelle_url} target="_blank" rel="noopener noreferrer">
            Zu service.berlin.de<span className="sr"> (öffnet in neuem Tab)</span>
          </a>
        </li>
        <li>
          <strong>Unterlagen bereitlegen.</strong>
          <ul className="haken">
            {antrag.unterlagen.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </li>
        <li>
          <strong>Angaben übertragen.</strong> Das PDF ist eine Übersicht Ihrer Angaben und kein
          amtliches Formular. Nutzen Sie es zum Ausfüllen des Anmeldeformulars oder bei der
          Online-Anmeldung.
        </li>
      </ol>
      <p className="hinweis">
        {antrag.zustaendig}. Gebühr: {antrag.gebuehr}.{antrag.frist && ` Frist: ${antrag.frist}.`}
      </p>
    </section>
  );
}
