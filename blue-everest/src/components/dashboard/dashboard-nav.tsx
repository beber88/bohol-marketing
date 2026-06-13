"use client";

import {
  LayoutDashboard, Megaphone, FileText, Users, Users2,
  Wallet, Settings, Bot, BookOpen, MessageSquare,
  Share2, DollarSign,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

type GroupId = "dashboard" | "marketing" | "sales" | "system";

interface NavGroup {
  group: GroupId;
  items: { id: string; icon: typeof LayoutDashboard }[];
}

const GROUPED_SECTIONS: NavGroup[] = [
  {
    group: "dashboard",
    items: [
      { id: "overview", icon: LayoutDashboard },
    ],
  },
  {
    group: "marketing",
    items: [
      { id: "campaigns", icon: Megaphone },
      { id: "content", icon: FileText },
      { id: "communityAgent", icon: Users2 },
      { id: "autoposter", icon: Share2 },
    ],
  },
  {
    group: "sales",
    items: [
      { id: "leadPipeline", icon: Users },
      { id: "conversations", icon: MessageSquare },
    ],
  },
  {
    group: "system",
    items: [
      { id: "agents", icon: Bot },
      { id: "budget", icon: Wallet },
      { id: "financials", icon: DollarSign },
      { id: "knowledge", icon: BookOpen },
      { id: "settings", icon: Settings },
    ],
  },
];

interface DashboardNavProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export function DashboardNav({ activeSection, onSectionChange }: DashboardNavProps) {
  const { t } = useTranslation();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {GROUPED_SECTIONS.map(({ group, items }, gi) => (
        <div key={group} className={gi > 0 ? "mt-3" : ""}>
          <div className="px-3 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-widest text-muted/60 hidden lg:block">
            {t.dashboard.groups[group]}
          </div>
          {items.map(({ id, icon: Icon }) => {
            const isActive = activeSection === id;
            const label = t.dashboard.sections[id as keyof typeof t.dashboard.sections];
            return (
              <button
                key={id}
                onClick={() => onSectionChange(id)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[#89AACC]/20 to-[#4E85BF]/20 text-white border border-[#4E85BF]/30"
                    : "text-muted hover:text-text-primary hover:bg-surface"
                }`}
                title={label}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-[#89AACC]" : "text-muted group-hover:text-text-primary"}
                />
                <span className="hidden lg:inline">{label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function DashboardMobileNav({ activeSection, onSectionChange }: DashboardNavProps) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-1 overflow-x-auto px-4 pb-3 scrollbar-hide">
      {GROUPED_SECTIONS.map(({ group, items }, gi) => (
        <div key={group} className="flex gap-1 items-center">
          {gi > 0 && <div className="w-px h-5 bg-stroke/40 mx-1 shrink-0" />}
          {items.map(({ id, icon: Icon }) => {
            const isActive = activeSection === id;
            const label = t.dashboard.sections[id as keyof typeof t.dashboard.sections];
            return (
              <button
                key={id}
                onClick={() => onSectionChange(id)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[#89AACC] to-[#4E85BF] text-white"
                    : "border border-stroke bg-surface text-muted"
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
