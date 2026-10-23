import { useEffect, useState } from "react";

export function useHashPfad(): string {
  const lese = () => window.location.hash.replace(/^#/, "") || "/";
  const [pfad, setPfad] = useState(lese);
  useEffect(() => {
    const neu = () => setPfad(lese());
    window.addEventListener("hashchange", neu);
    return () => window.removeEventListener("hashchange", neu);
  }, []);
  return pfad;
}

export const link = (pfad: string) => `#${pfad}`;
