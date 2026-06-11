"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { AgentsSection } from "./agents-section";
import { AgentReportsSection } from "./agent-reports-section";

type Tab = "agents" | "reports";

export function AgentsMergedSection() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("agents");

  const tabs: { id: Tab; label: string }[] = [
    { id: "agents", label: t.dashboard.tabs.agents },
    { id: "reports", label: t.dashboard.tabs.reports },
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
      {tab === "agents" && <AgentsSection />}
      {tab === "reports" && <AgentReportsSection />}
    </div>
  );
}
