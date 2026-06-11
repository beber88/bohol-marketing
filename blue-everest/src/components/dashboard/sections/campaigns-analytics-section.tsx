"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { CampaignsSection } from "./campaigns-section";
import { AnalyticsSection } from "./analytics-section";

type Tab = "live" | "history";

export function CampaignsAnalyticsSection() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("live");

  const tabs: { id: Tab; label: string }[] = [
    { id: "live", label: t.dashboard.tabs.live },
    { id: "history", label: t.dashboard.tabs.history },
  ];

  return (
    <div className="space-y-4">
      <div className="flex border-b border-stroke">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              tab === tb.id
                ? "border-[#4E85BF] text-[#89AACC]"
                : "border-transparent text-muted hover:text-text-primary"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>
      {tab === "live" && <CampaignsSection />}
      {tab === "history" && <AnalyticsSection />}
    </div>
  );
}
