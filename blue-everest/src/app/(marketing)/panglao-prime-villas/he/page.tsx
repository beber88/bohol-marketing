"use client";

import { useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import PrimeVillaHome from "../page";

export default function HebrewPage() {
  const { setLocale } = useTranslation();

  useEffect(() => {
    setLocale("he");
  }, [setLocale]);

  return <PrimeVillaHome />;
}
