"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { ConversationsInboxSection } from "./conversations-inbox-section";
import { SalesActivitySection } from "./sales-activity-section";
import { ChatMonitorSection } from "./chat-monitor-section";

type Tab = "inbox" | "salesAgents" | "chatbot";

export function ConversationsSection() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("inbox");

  const tabs: { id: Tab; label: string }[] = [
    { id: "inbox", label: "Conversations OS" },
    { id: "salesAgents", label: t.dashboard.tabs.salesAgents },
    { id: "chatbot", label: t.dashboard.tabs.chatbot },
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
      {tab === "inbox" && <ConversationsInboxSection />}
      {tab === "salesAgents" && <SalesActivitySection />}
      {tab === "chatbot" && <ChatMonitorSection />}
    </div>
  );
}
