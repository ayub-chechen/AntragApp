import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Antworten, DokArt } from "../inhalte/typen";
import { ablage } from "./ablage";
import { entschluessele, istTresor, neuesSalz, salzVon, schluesselAus, verschluessele, type Tresor } from "./tresor";

export interface Kind {
  id: string;
  vorname: string;
  geburtsdatum: string;
}

export interface Dokument {
  id: string;
  titel: string;
  art: DokArt;
  gueltigBis?: string;
  notiz?: string;
  datei?: { name: string; typ: string; groesse: number; daten: string };
  hinzugefuegt: string;
}

export interface Termin {
  id: string;
  titel: string;
  datum: string;
  uhrzeit?: string;
  notiz?: string;
}

export interface LageStand {
  antworten: Antworten;
  erledigt: string[];
}

export interface Daten {
  v: 1;
  profil: Record<string, string>;
  kinder: Kind[];
  lagen: Record<string, LageStand>;
  check: Antworten;
  dokumente: Dokument[];
  termine: Termin[];
}

export const leereDaten = (): Daten => ({ v: 1, profil: {}, kinder: [], lagen: {}, check: {}, dokumente: [], termine: [] });

export type TresorStatus = "laedt" | "keiner" | "gesperrt" | "offen";

interface DatenKontext {
  daten: Daten;
  aendere: (fn: (d: Daten) => Daten) => void;
  status: TresorStatus;
  erstelle: (pin: string) => Promise<void>;
  entsperre: (pin: string) => Promise<boolean>;
  sperre: () => void;
  loescheAlles: () => Promise<void>;
  sicherung: () => Promise<string>;
  einspielen: (text: string, pin: string) => Promise<"ok" | "pin" | "datei">;
  aenderePin: (neu: string) => Promise<void>;
}

const Kontext = createContext<DatenKontext | null>(null);
const SCHLUESSEL = "tresor";
const AUTO_SPERRE_MS = 15 * 60 * 1000;

export const neueId = () => crypto.getRandomValues(new Uint32Array(2)).join("-");

function ergaenze(d: Partial<Daten>): Daten {
  return { ...leereDaten(), ...d, v: 1 };
}

export function DatenAnbieter({ children }: { children: ReactNode }) {
  const [daten, setDaten] = useState<Daten>(leereDaten);
  const [status, setStatus] = useState<TresorStatus>("laedt");
  const schluessel = useRef<{ key: CryptoKey; salz: Uint8Array } | null>(null);
  const aktuell = useRef(daten);
  aktuell.current = daten;

  useEffect(() => {
    ablage
      .lies<Tresor>(SCHLUESSEL)
      .then((t) => setStatus(t ? "gesperrt" : "keiner"))
      .catch(() => setStatus("keiner"));
  }, []);

  const speichere = useCallback(async (d: Daten) => {
    const s = schluessel.current;
    if (!s) return;
    await ablage.schreibe(SCHLUESSEL, await verschluessele(d, s.key, s.salz));
  }, []);

  // Jede Änderung verschlüsselt speichern, sobald der Tresor offen ist.
  useEffect(() => {
    if (status !== "offen") return;
    const zeit = setTimeout(() => void speichere(daten), 250);
    return () => clearTimeout(zeit);
  }, [daten, status, speichere]);

  useEffect(() => {
    if (status !== "offen") return;
    const sofort = () => void speichere(aktuell.current);
    window.addEventListener("pagehide", sofort);
    return () => window.removeEventListener("pagehide", sofort);
  }, [status, speichere]);

  const sperre = useCallback(() => {
    void speichere(aktuell.current).finally(() => {
      schluessel.current = null;
      setDaten(leereDaten());
      setStatus("gesperrt");
    });
  }, [speichere]);

  // Nach 15 Minuten ohne Bedienung automatisch sperren.
  useEffect(() => {
    if (status !== "offen") return;
    let zeit = setTimeout(sperre, AUTO_SPERRE_MS);
    const neu = () => {
      clearTimeout(zeit);
      zeit = setTimeout(sperre, AUTO_SPERRE_MS);
    };
    const ereignisse = ["pointerdown", "keydown", "scroll"] as const;
    ereignisse.forEach((e) => window.addEventListener(e, neu, { passive: true }));
    return () => {
      clearTimeout(zeit);
      ereignisse.forEach((e) => window.removeEventListener(e, neu));
    };
  }, [status, sperre]);

  const wert = useMemo<DatenKontext>(
    () => ({
      daten,
      status,
      aendere: (fn) => setDaten((d) => fn(d)),
      erstelle: async (pin) => {
        const salz = neuesSalz();
        const key = await schluesselAus(pin, salz);
        schluessel.current = { key, salz };
        await ablage.schreibe(SCHLUESSEL, await verschluessele(aktuell.current, key, salz));
        setStatus("offen");
        // Bitten, dass der Browser die Daten nicht bei Platzmangel löscht.
        void navigator.storage?.persist?.().catch(() => false);
      },
      entsperre: async (pin) => {
        const t = await ablage.lies<Tresor>(SCHLUESSEL);
        if (!t) return false;
        const salz = salzVon(t);
        const key = await schluesselAus(pin, salz);
        try {
          const d = await entschluessele<Daten>(t, key);
          schluessel.current = { key, salz };
          setDaten(ergaenze(d));
          setStatus("offen");
          return true;
        } catch {
          return false;
        }
      },
      sperre,
      loescheAlles: async () => {
        await ablage.loesche(SCHLUESSEL);
        schluessel.current = null;
        setDaten(leereDaten());
        setStatus("keiner");
      },
      sicherung: async () => {
        const s = schluessel.current;
        if (!s) throw new Error("Tresor ist nicht offen");
        return JSON.stringify(await verschluessele(aktuell.current, s.key, s.salz));
      },
      einspielen: async (text, pin) => {
        let t: unknown;
        try {
          t = JSON.parse(text);
        } catch {
          return "datei";
        }
        if (!istTresor(t)) return "datei";
        const salz = salzVon(t);
        const key = await schluesselAus(pin, salz);
        try {
          const d = ergaenze(await entschluessele<Daten>(t, key));
          schluessel.current = { key, salz };
          await ablage.schreibe(SCHLUESSEL, t);
          setDaten(d);
          setStatus("offen");
          return "ok";
        } catch {
          return "pin";
        }
      },
      aenderePin: async (neu) => {
        const salz = neuesSalz();
        const key = await schluesselAus(neu, salz);
        schluessel.current = { key, salz };
        await ablage.schreibe(SCHLUESSEL, await verschluessele(aktuell.current, key, salz));
      },
    }),
    [daten, status, sperre],
  );

  return <Kontext.Provider value={wert}>{children}</Kontext.Provider>;
}

export function useDaten(): DatenKontext {
  const k = useContext(Kontext);
  if (!k) throw new Error("DatenAnbieter fehlt");
  return k;
}
