import { useEffect, useState, type RefObject } from "react";
import { ui } from "../i18n/ui";
import { useSprache } from "../i18n/sprache";

/** Liest einen Bereich mit der Sprachausgabe des Geräts vor. Nichts wird gesendet. */
export function Vorlesen({ ziel }: { ziel: RefObject<HTMLElement | null> }) {
  const { t, locale } = useSprache();
  const [spricht, setSpricht] = useState(false);
  const geht = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => () => void (geht && window.speechSynthesis.cancel()), [geht]);

  if (!geht) return null;

  const umschalten = () => {
    const synth = window.speechSynthesis;
    if (spricht) {
      synth.cancel();
      setSpricht(false);
      return;
    }
    const text = ziel.current?.innerText ?? "";
    if (!text.trim()) return;
    const satz = new SpeechSynthesisUtterance(text);
    satz.lang = locale;
    satz.rate = 0.95;
    const stimme = synth.getVoices().find((v) => v.lang.startsWith(locale.slice(0, 2)));
    if (stimme) satz.voice = stimme;
    satz.onend = () => setSpricht(false);
    satz.onerror = () => setSpricht(false);
    synth.cancel();
    synth.speak(satz);
    setSpricht(true);
  };

  return (
    <button type="button" className="knopf-klein" onClick={umschalten} aria-pressed={spricht}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
        {spricht ? (
          <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" fill="none" />
        ) : (
          <path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
      </svg>
      {spricht ? t(ui.vorlesenStopp) : t(ui.vorlesen)}
    </button>
  );
}
