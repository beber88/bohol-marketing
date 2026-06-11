"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { Locale, Translations } from "./types";
import { en } from "./en";
import { he } from "./he";

const T: Record<Locale, Translations> = { en, he };
const STORAGE_KEY = "blue-everest-locale";
const EVENT = "blue-everest-locale-change";

function isValidLocale(v: unknown): v is Locale {
  return v === "en" || v === "he";
}

function readLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const w = window as unknown as { __be_locale?: Locale };
  if (isValidLocale(w.__be_locale)) return w.__be_locale;
  const saved = localStorage.getItem(STORAGE_KEY);
  const locale = isValidLocale(saved) ? saved : "en";
  w.__be_locale = locale;
  return locale;
}

function writeLocale(locale: Locale) {
  const w = window as unknown as { __be_locale?: Locale };
  w.__be_locale = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.setAttribute("dir", locale === "he" ? "rtl" : "ltr");
  document.documentElement.setAttribute("lang", locale);
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      const w = window as unknown as { __be_locale?: Locale };
      const v = e.newValue;
      w.__be_locale = isValidLocale(v) ? v : "en";
      cb();
    }
  };
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", storageHandler);
  };
}

function getSnapshot(): Locale {
  return readLocale();
}

function getServerSnapshot(): Locale {
  return "en";
}

export function useTranslation() {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dir: "ltr" | "rtl" = locale === "he" ? "rtl" : "ltr";
  const t = T[locale];
  const set = useCallback((l: Locale) => writeLocale(l), []);
  return { locale, setLocale: set, t, dir };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Always ensure LTR on the main marketing site
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.setAttribute("lang", "en");
    const locale = readLocale();
    if (locale !== "en") {
      window.dispatchEvent(new Event(EVENT));
    }
  }, []);
  return <>{children}</>;
}

export type { Locale, Translations } from "./types";
