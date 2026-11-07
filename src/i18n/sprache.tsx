import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Sprache = "de" | "en" | "ru";
export const SPRACHEN: { id: Sprache; name: string; kurz: string; locale: string }[] = [
  { id: "de", name: "Deutsch", kurz: "DE", locale: "de-DE" },
  { id: "en", name: "English", kurz: "EN", locale: "en-GB" },
  { id: "ru", name: "Русский", kurz: "RU", locale: "ru-RU" },
];

/** Ein Text in allen Sprachen der App. Fehlt eine Sprache, meldet TypeScript das schon beim Bauen. */
export interface Tx {
  de: string;
  en: string;
  ru: string;
}

export const tx = (de: string, en: string, ru: string): Tx => ({ de, en, ru });

export type Text = Tx | string;

interface SprachKontext {
  sprache: Sprache;
  locale: string;
  setSprache: (s: Sprache) => void;
  t: (text: Text) => string;
}

const Kontext = createContext<SprachKontext | null>(null);

function startSprache(): Sprache {
  try {
    const gespeichert = localStorage.getItem("sprache");
    if (gespeichert === "de" || gespeichert === "en" || gespeichert === "ru") return gespeichert;
  } catch {
    /* privates Fenster: dann eben Browsersprache */
  }
  const browser = (navigator.language || "de").slice(0, 2);
  return browser === "ru" ? "ru" : browser === "en" ? "en" : "de";
}

export function SprachAnbieter({ children }: { children: ReactNode }) {
  const [sprache, setzeSprache] = useState<Sprache>(startSprache);

  useEffect(() => {
    document.documentElement.lang = sprache;
  }, [sprache]);

  const setSprache = useCallback((s: Sprache) => {
    setzeSprache(s);
    try {
      // Nur die Sprachwahl, keine persönlichen Angaben.
      localStorage.setItem("sprache", s);
    } catch {
      /* egal */
    }
  }, []);

  const wert = useMemo<SprachKontext>(
    () => ({
      sprache,
      locale: SPRACHEN.find((s) => s.id === sprache)!.locale,
      setSprache,
      t: (text) => (typeof text === "string" ? text : text[sprache] || text.de),
    }),
    [sprache, setSprache],
  );

  return <Kontext.Provider value={wert}>{children}</Kontext.Provider>;
}

export function useSprache(): SprachKontext {
  const k = useContext(Kontext);
  if (!k) throw new Error("SprachAnbieter fehlt");
  return k;
}
