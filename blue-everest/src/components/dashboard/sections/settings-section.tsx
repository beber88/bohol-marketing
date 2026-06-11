"use client";

import { useTranslation } from "@/lib/i18n";
import { BUSINESS_LINKS, PLATFORMS, DRIVE_ASSETS, CONTENT_RULES, VIDEOS } from "@/lib/data/dashboard-data";
import { StatusBadge } from "@/components/dashboard/cards/status-badge";
import { ExternalLink, AlertTriangle } from "lucide-react";

export function SettingsSection() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Business Links */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-4">{t.dashboard.settings.businessLinks}</h3>
        <div className="rounded-2xl border border-stroke bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-bg">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Type</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Link</th>
            </tr></thead>
            <tbody>
              {BUSINESS_LINKS.map(link => (
                <tr key={link.url} className="border-b border-stroke/50 hover:bg-surface/80">
                  <td className="px-5 py-3 text-muted">{link.type}</td>
                  <td className="px-5 py-3 font-medium">{link.name}</td>
                  <td className="px-5 py-3"><StatusBadge status={link.status} type="platform" /></td>
                  <td className="px-5 py-3">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-stroke px-3 py-1.5 text-xs font-medium hover:bg-surface hover:border-[#4E85BF]/40 transition">
                      {t.dashboard.common.open} <ExternalLink size={10} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Google Drive Assets */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-4">{t.dashboard.settings.driveAssets}</h3>
        <div className="rounded-2xl border border-stroke bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-bg">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Asset</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Type</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Size</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Link</th>
            </tr></thead>
            <tbody>
              {DRIVE_ASSETS.map(asset => (
                <tr key={asset.url} className="border-b border-stroke/50 hover:bg-surface/80">
                  <td className="px-5 py-3 font-medium">{asset.name}</td>
                  <td className="px-5 py-3 text-muted">{asset.type}</td>
                  <td className="px-5 py-3 text-muted">{asset.size || "-"}</td>
                  <td className="px-5 py-3">
                    <a href={asset.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-stroke px-3 py-1.5 text-xs font-medium hover:bg-surface hover:border-[#4E85BF]/40 transition">
                      {t.dashboard.common.view} <ExternalLink size={10} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Marketing Platforms */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-4">{t.dashboard.settings.platforms}</h3>
        <div className="rounded-2xl border border-stroke bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-bg">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Platform</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">ID</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Action</th>
            </tr></thead>
            <tbody>
              {PLATFORMS.map(p => (
                <tr key={p.name} className="border-b border-stroke/50 hover:bg-surface/80">
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3"><code className="text-xs text-muted bg-bg px-2 py-0.5 rounded">{p.id}</code></td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} type="platform" /></td>
                  <td className="px-5 py-3 text-xs text-muted">{p.actionNeeded || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Videos Inventory */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-4">Videos ({VIDEOS.length})</h3>
        <div className="rounded-2xl border border-stroke bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-bg">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">File</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Size</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Date</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Source</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted">Status</th>
            </tr></thead>
            <tbody>
              {VIDEOS.map(v => (
                <tr key={v.file} className={`border-b border-stroke/50 ${v.isNew ? "bg-emerald-500/5" : ""}`}>
                  <td className="px-5 py-3 font-medium text-xs">{v.file}</td>
                  <td className="px-5 py-3 text-muted">{v.size}</td>
                  <td className="px-5 py-3 text-muted">{v.date}</td>
                  <td className="px-5 py-3 text-muted">{v.source}</td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      status={v.isNew ? "phase2" : "active"}
                      label={v.isNew ? "New" : "Ready"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Content Rules */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-4">{t.dashboard.settings.contentRules}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTENT_RULES.map(rule => (
            <div
              key={rule.id}
              className={`rounded-xl p-4 ${
                "critical" in rule && rule.critical
                  ? "border border-red-500/30 bg-red-500/5"
                  : "border border-amber-500/20 bg-amber-500/5"
              }`}
            >
              <div className="flex items-start gap-2">
                {"critical" in rule && rule.critical && <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />}
                <div>
                  <h4 className={`text-sm font-semibold mb-1 ${"critical" in rule && rule.critical ? "text-red-400" : "text-amber-400"}`}>
                    {rule.title}
                  </h4>
                  <p className={`text-xs ${"critical" in rule && rule.critical ? "text-red-300/70" : "text-amber-300/70"}`}>
                    {rule.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
