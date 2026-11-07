/** Lädt Daten als Datei herunter, ganz ohne Server. */
export function ladeHerunter(inhalt: Uint8Array | string, dateiname: string, typ: string): void {
  const blob = new Blob([inhalt as BlobPart], { type: typ });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = dateiname;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function ladePdfWerkzeug() {
  const [{ erzeugeBriefe, briefAlsText }, { ladeSchriften }] = await Promise.all([import("./briefPdf"), import("./schriften")]);
  return { erzeugeBriefe, briefAlsText, schriften: await ladeSchriften() };
}

export async function kopiere(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
