"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";
import { DashboardNav, DashboardMobileNav } from "./dashboard-nav";
import { OverviewSection } from "./sections/overview-section";
import { CampaignsAnalyticsSection } from "./sections/campaigns-analytics-section";
import { ContentSection } from "./sections/content-section";
import { LeadPipelineSection } from "./sections/lead-pipeline-section";
import { BudgetSection } from "./sections/budget-section";
import { SettingsSection } from "./sections/settings-section";
import { AgentsMergedSection } from "./sections/agents-merged-section";
import { KnowledgeSection } from "./sections/knowledge-section";
import { ConversationsSection } from "./sections/conversations-section";
import { CommunityAgentSection } from "./sections/community-agent-section";
import { LeadRecoverySection } from "./sections/lead-recovery-section";
import { AutoposterSection } from "./sections/autoposter-section";
import { FinancialsSection } from "./sections/financials-section";
import { PortalsOverviewSection } from "./sections/portals-overview-section";
import { PortalsManagementSection } from "./sections/portals-management-section";
import { PortalsListingsSection } from "./sections/portals-listings-section";
import { PortalsPartnersSection } from "./sections/portals-partners-section";
import { PortalsAnalyticsSection } from "./sections/portals-analytics-section";
import { DashboardSectionBoundary } from "./dashboard-section-boundary";

export function DashboardShell() {
  const { t, dir } = useTranslation();
  const [activeSection, setActiveSection] = useState("overview");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("ppv-dashboard-theme");
    if (saved === "light") setIsDark(false);
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem("ppv-dashboard-theme", next ? "dark" : "light");
      return next;
    });
  };

  const renderSection = () => {
    switch (activeSection) {
      case "overview": return <OverviewSection />;
      case "campaigns": return <CampaignsAnalyticsSection />;
      case "content": return <ContentSection />;
      case "leadPipeline": return <><LeadRecoverySection /><LeadPipelineSection /></>;
      case "budget": return <BudgetSection />;
      case "agents": return <AgentsMergedSection />;
      case "conversations": return <ConversationsSection />;
      case "knowledge": return <KnowledgeSection />;
      case "communityAgent": return <CommunityAgentSection />;
      case "autoposter": return <AutoposterSection />;
      case "financials": return <FinancialsSection />;
      case "portalOverview": return <PortalsOverviewSection />;
      case "portalManagement": return <PortalsManagementSection />;
      case "portalListings": return <PortalsListingsSection />;
      case "portalPartners": return <PortalsPartnersSection />;
      case "portalAnalytics": return <PortalsAnalyticsSection />;
      case "settings": return <SettingsSection />;
      default: return <OverviewSection />;
    }
  };

  return (
    <div className={`flex min-h-screen ${isDark ? "" : "dashboard-light"}`} dir={dir}>
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex w-16 lg:w-56 shrink-0 flex-col border-r border-stroke bg-surface/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 border-b border-stroke p-4">
          <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-[#89AACC] to-[#4E85BF] flex items-center justify-center">
            <span className="text-xs font-bold text-white">PV</span>
          </div>
          <div className="hidden lg:block">
            <div className="text-sm font-semibold">{t.dashboard.title}</div>
            <div className="text-xs text-muted">{t.dashboard.subtitle}</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <DashboardNav activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>
        <div className="border-t border-stroke p-3">
          <LanguageToggle />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header bar */}
        <header className="flex items-center justify-between border-b border-stroke bg-surface/30 backdrop-blur-sm px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#89AACC] to-[#4E85BF] flex items-center justify-center">
                <span className="text-xs font-bold text-white">PV</span>
              </div>
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold">
                {t.dashboard.sections[activeSection as keyof typeof t.dashboard.sections] || t.dashboard.title}
              </h1>
              <p className="text-xs text-muted">Blue Everest Asset Group</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              LIVE
            </span>
            <span className="hidden sm:inline text-xs text-muted">
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <div className="hidden md:block">
              <LanguageToggle />
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="md:hidden border-b border-stroke bg-surface/30 pt-3">
          <DashboardMobileNav activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>

        {/* Section content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="mx-auto max-w-[1200px]">
            <DashboardSectionBoundary sectionId={activeSection} key={activeSection}>
              {renderSection()}
            </DashboardSectionBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
