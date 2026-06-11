"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { TodaysPostsSection } from "./todays-posts-section";
import { PostGallerySection } from "./post-gallery-section";
import { PublishingCalendarSection } from "./publishing-calendar-section";

type Tab = "today" | "gallery" | "calendar";

export function ContentSection() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("today");

  const tabs: { id: Tab; label: string }[] = [
    { id: "today", label: t.dashboard.tabs.today },
    { id: "gallery", label: t.dashboard.tabs.gallery },
    { id: "calendar", label: t.dashboard.tabs.calendar },
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
      {tab === "today" && <TodaysPostsSection />}
      {tab === "gallery" && <PostGallerySection />}
      {tab === "calendar" && <PublishingCalendarSection />}
    </div>
  );
}
