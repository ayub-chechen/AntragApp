import type { Schritt } from "../antraege/typen";

interface Props {
  schritte: Schritt[];
  aktuell: number;
  onWechsel: (index: number) => void;
}

/** Fortschritt als Linienplan: erledigte Stationen sind anklickbar. */
export function Linie({ schritte, aktuell, onWechsel }: Props) {
  return (
    <nav aria-label="Fortschritt" className="linie">
      <ol>
        {schritte.map((s, i) => {
          const zustand = i < aktuell ? "erledigt" : i === aktuell ? "aktuell" : "offen";
          return (
            <li key={s.id} className={`station station-${zustand}`}>
              {i < aktuell ? (
                <button type="button" onClick={() => onWechsel(i)}>
                  <span className="punkt" aria-hidden="true" />
                  <span className="station-name">
                    {s.titel}
                    <span className="sr"> (erledigt, zurück zu diesem Schritt)</span>
                  </span>
                </button>
              ) : (
                <span aria-current={i === aktuell ? "step" : undefined}>
                  <span className="punkt" aria-hidden="true" />
                  <span className="station-name">{s.titel}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="linie-stand" aria-hidden="true">
        Schritt {aktuell + 1} von {schritte.length}: {schritte[aktuell].titel}
      </p>
    </nav>
  );
}
