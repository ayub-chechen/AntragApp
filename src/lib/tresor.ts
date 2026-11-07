/**
 * Verschlüsselung der gespeicherten Angaben mit der WebCrypto-Schnittstelle des Browsers.
 * Aus PIN oder Passwort wird mit PBKDF2 (SHA-256, 250.000 Runden) ein AES-GCM-Schlüssel
 * abgeleitet. Gespeichert werden nur Salz, Startwert (IV) und der verschlüsselte Inhalt.
 * Ohne PIN lässt sich nichts wiederherstellen – auch nicht von uns.
 */

export const RUNDEN = 250_000;

export interface Tresor {
  v: 1;
  salz: string;
  iv: string;
  inhalt: string;
}

const b64 = (bytes: Uint8Array) => {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};

const vonB64 = (text: string) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

export function neuesSalz(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

export async function schluesselAus(pin: string, salz: Uint8Array, runden = RUNDEN): Promise<CryptoKey> {
  const basis = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salz as BufferSource, iterations: runden, hash: "SHA-256" },
    basis,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function verschluessele(daten: unknown, schluessel: CryptoKey, salz: Uint8Array): Promise<Tresor> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const klar = new TextEncoder().encode(JSON.stringify(daten));
  const geheim = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, schluessel, klar));
  return { v: 1, salz: b64(salz), iv: b64(iv), inhalt: b64(geheim) };
}

/** Wirft einen Fehler, wenn die PIN falsch ist oder der Tresor verändert wurde. */
export async function entschluessele<T>(tresor: Tresor, schluessel: CryptoKey): Promise<T> {
  const klar = await crypto.subtle.decrypt({ name: "AES-GCM", iv: vonB64(tresor.iv) as BufferSource }, schluessel, vonB64(tresor.inhalt) as BufferSource);
  return JSON.parse(new TextDecoder().decode(klar)) as T;
}

export function salzVon(tresor: Tresor): Uint8Array {
  return vonB64(tresor.salz);
}

export function istTresor(x: unknown): x is Tresor {
  const t = x as Tresor;
  return !!t && t.v === 1 && typeof t.salz === "string" && typeof t.iv === "string" && typeof t.inhalt === "string";
}
