import normalUrl from "dejavu-fonts-ttf/ttf/DejaVuSans.ttf?url";
import fettUrl from "dejavu-fonts-ttf/ttf/DejaVuSans-Bold.ttf?url";
import type { Schriften } from "./pdf";

let cache: Promise<Schriften> | null = null;

/** Lädt die PDF-Schriften erst bei Bedarf, vom eigenen Server (kein Drittanbieter). */
export function ladeSchriften(): Promise<Schriften> {
  cache ??= Promise.all([normalUrl, fettUrl].map((u) => fetch(u).then((r) => r.arrayBuffer()))).then(
    ([normal, fett]) => ({ normal, fett }),
  );
  return cache;
}
