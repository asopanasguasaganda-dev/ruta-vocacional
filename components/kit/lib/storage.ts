import { useCallback, type SetStateAction } from "react";
import { getSession, saveValue, useSession } from "./session";
export function useLocalState<T>(key: string, initial: T, isValid: (value: unknown) => value is T) {
 const snapshot = useSession();
 const candidate = snapshot.values[key];
 const value = isValid(candidate) ? candidate : initial;
 const setValue = useCallback(async (next: SetStateAction<T>) => {
  const latest = getSession().values[key];
  const previous = isValid(latest) ? latest : initial;
  const updated = typeof next === "function" ? (next as (current: T) => T)(previous) : next;
  try { await saveValue(key, updated); } catch { /* The global sync status retains the failed draft; flush rejects explicit confirmations. */ }
 }, [key, initial, isValid]);
 return [value, setValue, snapshot.pending === 0 && !snapshot.error] as const;
}
export const isNumberRecord = (v: unknown): v is Record<string, number> =>
  !!v &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  Object.values(v).every((x) => Number.isInteger(x) && x >= 1 && x <= 6);
export const isStringRecord = (v: unknown): v is Record<string, string> =>
  !!v &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  Object.values(v).every((x) => typeof x === "string");
export const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");
export function downloadText(
  name: string,
  text: string,
  type = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function downloadCSV(name: string, rows: (string | number)[][]) {
  const cell = (v: string | number) => {
    let s = String(v);
    if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  downloadText(
    name,
    "\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n"),
    "text/csv;charset=utf-8",
  );
}
