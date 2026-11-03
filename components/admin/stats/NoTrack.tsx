"use client";
import { useSyncExternalStore } from "react";
import { Toggle } from "../fields";

/* So the owner's own visits do not inflate the numbers. Kept in this browser only (localStorage on
   the site's address), and read by the site's counter and by the Meta Pixel code. */
const KEY = "porto:notrack";
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => { listeners.delete(fn); window.removeEventListener("storage", fn); };
};
const read = (): "on" | "off" => { try { return window.localStorage.getItem(KEY) === "1" ? "on" : "off"; } catch { return "off"; } };

export function NoTrack() {
  const state = useSyncExternalStore(subscribe, read, () => null);
  if (state === null) return null;
  return (
    <Toggle
      label="Jangan hitung kunjungan dari browser ini"
      checked={state === "on"}
      onChange={(v) => {
        try { if (v) window.localStorage.setItem(KEY, "1"); else window.localStorage.removeItem(KEY); } catch { /* storage blocked */ }
        for (const fn of listeners) fn();
      }}
      hint="Nyalakan di setiap browser yang Anda pakai untuk membuka situs sendiri (laptop dan HP): buka admin di browser itu, lalu nyalakan di sini."
    />
  );
}
