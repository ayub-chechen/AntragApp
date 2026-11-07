/** Kleine Hülle um IndexedDB. Hier liegt nur der verschlüsselte Tresor. */

const DB = "antragslotse";
const STORE = "ablage";

function oeffne(): Promise<IDBDatabase> {
  return new Promise((ok, fehler) => {
    const anfrage = indexedDB.open(DB, 1);
    anfrage.onupgradeneeded = () => anfrage.result.createObjectStore(STORE);
    anfrage.onsuccess = () => ok(anfrage.result);
    anfrage.onerror = () => fehler(anfrage.error);
  });
}

async function mit<T>(modus: IDBTransactionMode, arbeit: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await oeffne();
  try {
    return await new Promise<T>((ok, fehler) => {
      const tx = db.transaction(STORE, modus);
      const anfrage = arbeit(tx.objectStore(STORE));
      tx.oncomplete = () => ok(anfrage.result);
      tx.onerror = () => fehler(tx.error);
      tx.onabort = () => fehler(tx.error);
    });
  } finally {
    db.close();
  }
}

export const ablage = {
  lies: <T>(schluessel: string) => mit<T | undefined>("readonly", (s) => s.get(schluessel) as IDBRequest<T | undefined>),
  schreibe: (schluessel: string, wert: unknown) => mit("readwrite", (s) => s.put(wert, schluessel)).then(() => undefined),
  loesche: (schluessel: string) => mit("readwrite", (s) => s.delete(schluessel)).then(() => undefined),
};
