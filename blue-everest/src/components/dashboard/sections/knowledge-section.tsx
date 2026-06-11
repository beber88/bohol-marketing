"use client";

import { useState } from "react";
import {
  BookOpen, FileText, Mail, MessageSquare, Shield,
  TrendingUp, Search, Database, Globe, Clock, Upload,
} from "lucide-react";

const CATEGORIES = [
  { name: "Marketing Pillars", icon: TrendingUp, count: 10, color: "text-emerald-400 bg-emerald-500/10", desc: "Verified data points about Panglao/Bohol" },
  { name: "Research Reports", icon: Globe, count: 3, color: "text-[#89AACC] bg-[#89AACC]/10", desc: "Bohol brand, Israel-PH investment, ROI analysis" },
  { name: "Ad Copy Library", icon: FileText, count: 13, color: "text-purple-400 bg-purple-500/10", desc: "Meta IL/PH, Google Search variants" },
  { name: "Email Templates", icon: Mail, count: 23, color: "text-amber-400 bg-amber-500/10", desc: "5-email nurture + transactional" },
  { name: "WhatsApp Flows", icon: MessageSquare, count: 12, color: "text-green-400 bg-green-500/10", desc: "WATI flow JSONs for IL/PH" },
  { name: "Brand Guidelines", icon: Shield, count: 12, color: "text-red-400 bg-red-500/10", desc: "12 SHARED_RULES for brand guard" },
];

const DOCUMENTS = [
  { title: "Panglao is NEXT (Global Trending)", type: "marketing_pillar", lang: "EN", source: "MARKETING_SPINE_10_PILLARS.md", chunks: 3 },
  { title: "Tourism at Record Highs", type: "marketing_pillar", lang: "EN", source: "MARKETING_SPINE_10_PILLARS.md", chunks: 2 },
  { title: "Airport at Full Capacity", type: "marketing_pillar", lang: "EN", source: "MARKETING_SPINE_10_PILLARS.md", chunks: 2 },
  { title: "Third Bridge Funded by France", type: "marketing_pillar", lang: "EN", source: "MARKETING_SPINE_10_PILLARS.md", chunks: 2 },
  { title: "P25B Resort Township", type: "marketing_pillar", lang: "EN", source: "MARKETING_SPINE_10_PILLARS.md", chunks: 3 },
  { title: "Brand Gravity (JW Marriott + Accor)", type: "marketing_pillar", lang: "EN", source: "MARKETING_SPINE_10_PILLARS.md", chunks: 2 },
  { title: "Bohol Global Brand Research", type: "research", lang: "EN", source: "RESEARCH_BOHOL_GLOBAL_BRAND.md", chunks: 8 },
  { title: "Israel-PH Investment Research", type: "research", lang: "EN/HE", source: "RESEARCH_ISRAEL_PH_INVESTMENT.md", chunks: 12 },
  { title: "ROI Villa Analysis", type: "research", lang: "EN", source: "RESEARCH_ROI_VILLA_ANALYSIS.md", chunks: 6 },
  { title: "Campaign Israel (Hebrew)", type: "ad_copy", lang: "HE", source: "CAMPAIGN-ISRAEL.md", chunks: 15 },
  { title: "Campaign Philippines", type: "ad_copy", lang: "EN/TL", source: "CAMPAIGN-PHILIPPINES.md", chunks: 12 },
  { title: "Master Hooks Library", type: "ad_copy", lang: "EN/HE", source: "MASTER-HOOKS.md", chunks: 10 },
];

export function KnowledgeSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);

  const totalDocs = CATEGORIES.reduce((s, c) => s + c.count, 0);
  const totalChunks = DOCUMENTS.reduce((s, d) => s + d.chunks, 0);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch("/api/marketing/knowledge/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, limit: 5 }),
      });
      const data = await res.json();
      setSearchResults(data.results?.map((r: { title: string }) => r.title) || ["No results found"]);
    } catch {
      setSearchResults(["Search unavailable - connect Supabase first"]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface rounded-2xl border border-stroke p-5 text-center">
          <Database className="mx-auto mb-2 text-[#89AACC]" size={20} />
          <p className="font-display text-2xl font-bold">{totalDocs}</p>
          <p className="text-xs text-muted">Total Documents</p>
        </div>
        <div className="bg-surface rounded-2xl border border-stroke p-5 text-center">
          <BookOpen className="mx-auto mb-2 text-purple-400" size={20} />
          <p className="font-display text-2xl font-bold">{totalChunks}</p>
          <p className="text-xs text-muted">Vector Chunks</p>
        </div>
        <div className="bg-surface rounded-2xl border border-stroke p-5 text-center">
          <Globe className="mx-auto mb-2 text-emerald-400" size={20} />
          <p className="font-display text-2xl font-bold">4</p>
          <p className="text-xs text-muted">Languages</p>
        </div>
        <div className="bg-surface rounded-2xl border border-stroke p-5 text-center">
          <Clock className="mx-auto mb-2 text-amber-400" size={20} />
          <p className="font-display text-2xl font-bold">Pending</p>
          <p className="text-xs text-muted">Ingestion Status</p>
        </div>
      </div>

      {/* Semantic Search */}
      <div className="bg-surface rounded-2xl border border-stroke p-6">
        <h2 className="font-display text-lg font-semibold mb-4">Semantic Search</h2>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search knowledge base... (e.g., 'ROI data for Israeli investors')"
              className="w-full rounded-xl border border-stroke bg-white/5 px-10 py-2.5 text-sm placeholder:text-muted/50 outline-none focus:border-[#4E85BF]/50"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="rounded-xl bg-gradient-to-r from-[#89AACC] to-[#4E85BF] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {searching ? "..." : "Search"}
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((r, i) => (
              <div key={i} className="rounded-lg bg-white/5 px-4 py-2 text-sm text-muted">{r}</div>
            ))}
          </div>
        )}
      </div>

      {/* Category Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Content Categories</h2>
          <button className="flex items-center gap-2 rounded-xl border border-stroke px-4 py-2 text-sm text-muted hover:text-white hover:border-[#4E85BF]/30 transition-colors">
            <Upload size={14} />
            Ingest Documents
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.name} className="bg-surface rounded-xl border border-stroke p-5 hover:border-[#4E85BF]/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${cat.color}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{cat.name}</h3>
                    <p className="text-xs text-muted">{cat.desc}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-display font-bold">{cat.count}</span>
                  <span className="text-xs text-muted">documents</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Document List */}
      <div className="bg-surface rounded-2xl border border-stroke overflow-hidden">
        <div className="px-6 py-4 border-b border-stroke">
          <h2 className="font-display text-lg font-semibold">Document Index</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke text-left text-xs text-muted">
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Language</th>
                <th className="px-6 py-3 font-medium">Source</th>
                <th className="px-6 py-3 font-medium">Chunks</th>
              </tr>
            </thead>
            <tbody>
              {DOCUMENTS.map((doc, i) => (
                <tr key={i} className="border-b border-stroke/50 hover:bg-white/[0.02]">
                  <td className="px-6 py-3 font-medium">{doc.title}</td>
                  <td className="px-6 py-3">
                    <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-muted">{doc.type}</span>
                  </td>
                  <td className="px-6 py-3 text-muted">{doc.lang}</td>
                  <td className="px-6 py-3 text-muted text-xs">{doc.source}</td>
                  <td className="px-6 py-3 text-muted">{doc.chunks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
