import { useEffect, useState } from "react";

interface InstallEreignis extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let gemerkt: InstallEreignis | null = null;
const hoerer = new Set<() => void>();

/** Chrome und Edge bieten „App installieren“ an; das Ereignis früh abfangen. */
export function merkeInstallation() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    gemerkt = e as InstallEreignis;
    hoerer.forEach((h) => h());
  });
  window.addEventListener("appinstalled", () => {
    gemerkt = null;
    hoerer.forEach((h) => h());
  });
}

export function useInstallation() {
  const [, neu] = useState(0);
  useEffect(() => {
    const h = () => neu((n) => n + 1);
    hoerer.add(h);
    return () => void hoerer.delete(h);
  }, []);
  const installiert = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  return {
    installiert,
    moeglich: !!gemerkt,
    installiere: async () => {
      if (!gemerkt) return;
      await gemerkt.prompt();
      gemerkt = null;
      neu((n) => n + 1);
    },
  };
}
