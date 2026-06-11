"use client";

import { useTranslation } from "@/lib/i18n";

export function LanguageToggle() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="flex items-center rounded-full border border-stroke bg-surface/50 p-0.5">
      <button
        onClick={() => setLocale("en")}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
          locale === "en"
            ? "bg-gradient-to-r from-[#89AACC] to-[#4E85BF] text-white"
            : "text-muted hover:text-text-primary"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("he")}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
          locale === "he"
            ? "bg-gradient-to-r from-[#89AACC] to-[#4E85BF] text-white"
            : "text-muted hover:text-text-primary"
        }`}
      >
        HE
      </button>
    </div>
  );
}
