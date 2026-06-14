"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Handshake, Loader2, RefreshCw, Plus, X, QrCode,
  Sparkles, ChevronDown, ChevronUp, Globe, Phone, Mail,
  MessageCircle, Users, TrendingUp, Trash2, Copy, Check,
} from "lucide-react";
import { StatusBadge } from "../cards/status-badge";
import { useTranslation } from "@/lib/i18n";

// --- Bilingual Labels ---

const LABELS = {
  he: {
    title: "שותפי הפצה",
    subtitle: "מלונות, ריזורטים, ברוקרים ועורכי דין שמפנים לידים תמורת עמלה",
    addPartner: "הוסף שותף",
    workflow: "הוסף שותף → צור QR → שלח הצעת שותפות → עקוב אחרי הפניות",
    allTypes: "כל הסוגים",
    allStatuses: "כל הסטטוסים",
    allCountries: "כל המדינות",
    noPartners: "עדיין אין שותפים.",
    noPartnersHint: "הוסף את השותף הראשון שלך - מלון, ריזורט או ברוקר בבוהול.",
    contact: "פרטי קשר",
    email: "אימייל",
    phone: "טלפון",
    whatsapp: "וואטסאפ",
    agreement: "הסכם",
    commission: "עמלה",
    referrals: "הפניות",
    conversions: "המרות",
    notes: "הערות",
    generateQR: "צור QR",
    generateProposal: "צור הצעת שותפות (AI)",
    delete: "מחק",
    deleteConfirm: "למחוק את השותף הזה? לא ניתן לבטל.",
    trackingUrl: "קישור מעקב",
    copied: "הועתק!",
    copy: "העתק",
    aiProposal: "הצעת שותפות (AI)",
    cost: "עלות",
    referralHistory: "היסטוריית הפניות",
    noReferrals: "עדיין אין הפניות.",
    formTitle: "הוסף שותף חדש",
    partnerName: "שם השותף *",
    partnerType: "סוג שותף *",
    country: "מדינה",
    commissionPct: "אחוז עמלה",
    saving: "שומר...",
    save: "שמור",
    cancel: "ביטול",
    notSet: "לא הוגדר",
    na: "לא זמין",
    unknownLead: "ליד לא ידוע",
    via: "דרך",
    errorCreate: "שגיאה ביצירת שותף",
    errorNetwork: "שגיאת רשת",
    workflowSendProposal: "שלח הצעה",
    workflowTrackReferrals: "עקוב אחרי הפניות",
    types: {
      hotel: "מלון",
      resort: "ריזורט",
      dive_shop: "חנות צלילה",
      transport: "הסעות VIP",
      concierge: "קונסיירז'",
      lawyer: 'עורך דין מקרקעין',
      accountant: "רואה חשבון",
      wealth_advisor: "יועץ פיננסי",
      immigration_consultant: "יועץ הגירה",
      property_management: "ניהול נכסים",
      broker: "ברוקר נדל\"ן",
      referral_individual: "מפנה פרטי",
      remittance_center: "מרכז העברות כספים",
      business_association: "התאחדות עסקית",
      ofw_community: "קהילת OFW",
    } as Record<string, string>,
    statuses: {
      prospect: "פוטנציאלי",
      contacted: "נוצר קשר",
      negotiating: "במו\"מ",
      active: "פעיל",
      paused: "מושהה",
      terminated: "הסתיים",
    } as Record<string, string>,
    refStatuses: {
      converted: "הומר",
      pending: "ממתין",
      lost: "אבד",
    } as Record<string, string>,
  },
  en: {
    title: "Distribution Partners",
    subtitle: "Hotels, resorts, brokers and lawyers who refer leads for commission",
    addPartner: "Add Partner",
    workflow: "Add Partner → Create QR → Send Proposal → Track Referrals",
    allTypes: "All Types",
    allStatuses: "All Statuses",
    allCountries: "All Countries",
    noPartners: "No partners yet.",
    noPartnersHint: "Add your first partner - a hotel, resort, or broker in Bohol.",
    contact: "Contact",
    email: "Email",
    phone: "Phone",
    whatsapp: "WhatsApp",
    agreement: "Agreement",
    commission: "Commission",
    referrals: "Referrals",
    conversions: "Conversions",
    notes: "Notes",
    generateQR: "Generate QR",
    generateProposal: "Generate AI Proposal",
    delete: "Delete",
    deleteConfirm: "Delete this partner? This cannot be undone.",
    trackingUrl: "Tracking URL",
    copied: "Copied!",
    copy: "Copy",
    aiProposal: "AI Proposal",
    cost: "Cost",
    referralHistory: "Referral History",
    noReferrals: "No referrals yet.",
    formTitle: "Add New Partner",
    partnerName: "Partner Name *",
    partnerType: "Partner Type *",
    country: "Country",
    commissionPct: "Commission %",
    saving: "Saving...",
    save: "Save",
    cancel: "Cancel",
    notSet: "Not set",
    na: "N/A",
    unknownLead: "Unknown lead",
    via: "via",
    errorCreate: "Error creating partner",
    errorNetwork: "Network error",
    workflowSendProposal: "Send Proposal",
    workflowTrackReferrals: "Track Referrals",
    types: {
      hotel: "Hotel",
      resort: "Resort",
      dive_shop: "Dive Shop",
      transport: "VIP Transport",
      concierge: "Concierge",
      lawyer: "Real Estate Lawyer",
      accountant: "Accountant",
      wealth_advisor: "Wealth Advisor",
      immigration_consultant: "Immigration Consultant",
      property_management: "Property Management",
      broker: "Real Estate Broker",
      referral_individual: "Individual Referrer",
      remittance_center: "Remittance Center",
      business_association: "Business Association",
      ofw_community: "OFW Community",
    } as Record<string, string>,
    statuses: {
      prospect: "Prospect",
      contacted: "Contacted",
      negotiating: "Negotiating",
      active: "Active",
      paused: "Paused",
      terminated: "Terminated",
    } as Record<string, string>,
    refStatuses: {
      converted: "Converted",
      pending: "Pending",
      lost: "Lost",
    } as Record<string, string>,
  },
};

// --- Types ---

interface Partner {
  id: string;
  partner_type: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  location: string | null;
  country: string | null;
  agreement_type: string | null;
  commission_pct: number | null;
  agreement_status: string;
  qr_code_id: string | null;
  total_referrals: number;
  total_conversions: number;
  notes: string | null;
  created_at: string;
}

interface Referral {
  id: string;
  partner_id: string;
  lead_id: string | null;
  status: string;
  referral_source: string | null;
  created_at: string;
  partners: { name: string } | null;
  leads: { full_name: string; lead_status: string } | null;
}

interface PartnerForm {
  name: string;
  partner_type: string;
  country: string;
  email: string;
  phone: string;
  whatsapp: string;
  commission_pct: string;
  notes: string;
}

// --- Constants ---

const PARTNER_TYPES = [
  "hotel", "resort", "dive_shop", "transport", "concierge",
  "lawyer", "accountant", "wealth_advisor", "immigration_consultant",
  "property_management", "broker", "referral_individual",
  "remittance_center", "business_association", "ofw_community",
] as const;

const AGREEMENT_STATUSES = [
  "prospect", "contacted", "negotiating", "active", "paused", "terminated",
] as const;

const PARTNER_TYPE_COLORS: Record<string, string> = {
  hotel: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  resort: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  dive_shop: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  transport: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  concierge: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  lawyer: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  accountant: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  wealth_advisor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  immigration_consultant: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  property_management: "bg-lime-500/10 text-lime-400 border-lime-500/30",
  broker: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  referral_individual: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  remittance_center: "bg-red-500/10 text-red-400 border-red-500/30",
  business_association: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30",
  ofw_community: "bg-amber-500/10 text-amber-400 border-amber-500/30",
};

const STATUS_TO_PORTAL: Record<string, string> = {
  active: "configured",
  prospect: "partial",
  contacted: "partial",
  negotiating: "partial",
  paused: "inactive",
  terminated: "not_configured",
};

const EMPTY_FORM: PartnerForm = {
  name: "", partner_type: "hotel", country: "", email: "",
  phone: "", whatsapp: "", commission_pct: "", notes: "",
};

// --- Add Partner Modal ---

function AddPartnerModal({
  onClose,
  onAdded,
  L,
  dir,
}: {
  onClose: () => void;
  onAdded: () => void;
  L: typeof LABELS.he;
  dir: "rtl" | "ltr";
}) {
  const [form, setForm] = useState<PartnerForm>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.partner_type) return;
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        partner_type: form.partner_type,
        agreement_status: "prospect",
      };
      if (form.country.trim()) body.country = form.country.trim();
      if (form.email.trim()) body.email = form.email.trim();
      if (form.phone.trim()) body.phone = form.phone.trim();
      if (form.whatsapp.trim()) body.whatsapp = form.whatsapp.trim();
      if (form.commission_pct.trim()) body.commission_pct = parseFloat(form.commission_pct);
      if (form.notes.trim()) body.notes = form.notes.trim();

      const res = await fetch("/api/marketing/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || L.errorCreate);
        setSaving(false);
        return;
      }
      onAdded();
      onClose();
    } catch {
      setError(L.errorNetwork);
    }
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        dir={dir}
        className="bg-[#1a1a2e] border border-stroke rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-stroke">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Plus size={16} className="text-emerald-400" /> {L.formTitle}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
            <X size={16} className="text-muted" />
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-3 p-2 rounded-lg text-xs bg-red-500/10 text-red-400">
            {error}
          </div>
        )}

        <div className="p-4 space-y-3">
          <input
            placeholder={L.partnerName}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-black/30 border border-stroke rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-[#4E85BF]/50"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.partner_type}
              onChange={(e) => setForm({ ...form, partner_type: e.target.value })}
              className="bg-black/30 border border-stroke rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4E85BF]/50"
            >
              {PARTNER_TYPES.map((t) => (
                <option key={t} value={t}>{L.types[t] || t}</option>
              ))}
            </select>

            <input
              placeholder={L.country}
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="bg-black/30 border border-stroke rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-[#4E85BF]/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder={L.email}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-black/30 border border-stroke rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-[#4E85BF]/50"
            />
            <input
              placeholder={L.phone}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="bg-black/30 border border-stroke rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-[#4E85BF]/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder={L.whatsapp}
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="bg-black/30 border border-stroke rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-[#4E85BF]/50"
            />
            <input
              placeholder={L.commissionPct}
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={form.commission_pct}
              onChange={(e) => setForm({ ...form, commission_pct: e.target.value })}
              className="bg-black/30 border border-stroke rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-[#4E85BF]/50"
            />
          </div>

          <textarea
            placeholder={L.notes}
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full bg-black/30 border border-stroke rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-[#4E85BF]/50"
          />

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={saving || !form.name.trim()}
              className="flex-1 rounded-lg bg-[#4E85BF] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d6fa3] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {saving ? L.saving : L.save}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-stroke px-3 py-1.5 text-xs font-medium text-muted hover:text-text-primary hover:bg-surface transition-colors"
            >
              {L.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

export function PortalsPartnersSection() {
  const { locale } = useTranslation();
  const L = LABELS[locale === "he" ? "he" : "en"];
  const dir = locale === "he" ? "rtl" : "ltr";
  const dateLocale = locale === "he" ? "he-IL" : "en-US";

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCountry, setFilterCountry] = useState("");

  // Detail-panel state
  const [qrLoading, setQrLoading] = useState<string | null>(null);
  const [qrResult, setQrResult] = useState<{ trackingUrl: string; qrDataUrl?: string } | null>(null);
  const [proposalLoading, setProposalLoading] = useState<string | null>(null);
  const [proposalText, setProposalText] = useState<string | null>(null);
  const [proposalCost, setProposalCost] = useState<number | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const fetchPartners = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterType) params.set("partnerType", filterType);
    if (filterStatus) params.set("status", filterStatus);
    if (filterCountry) params.set("country", filterCountry);
    const qs = params.toString();
    fetch(`/api/marketing/partners${qs ? `?${qs}` : ""}`)
      .then((r) => r.json())
      .then((d) => { setPartners(d.partners || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filterType, filterStatus, filterCountry]);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  const handleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setQrResult(null);
      setProposalText(null);
      setProposalCost(null);
      setReferrals([]);
      return;
    }
    setExpandedId(id);
    setQrResult(null);
    setProposalText(null);
    setProposalCost(null);
    // Fetch referrals for this partner
    setReferralsLoading(true);
    fetch(`/api/marketing/partner-referrals?partnerId=${id}`)
      .then((r) => r.json())
      .then((d) => { setReferrals(d.referrals || []); setReferralsLoading(false); })
      .catch(() => setReferralsLoading(false));
  };

  const handleGenerateQR = async (partnerId: string) => {
    setQrLoading(partnerId);
    try {
      const res = await fetch(`/api/marketing/partners/${partnerId}/qr`);
      const data = await res.json();
      if (data.success !== false) {
        setQrResult({ trackingUrl: data.trackingUrl, qrDataUrl: data.qrDataUrl });
      }
    } catch { /* ignore */ }
    setQrLoading(null);
  };

  const handleGenerateProposal = async (partnerId: string) => {
    setProposalLoading(partnerId);
    setProposalText(null);
    setProposalCost(null);
    try {
      const res = await fetch(`/api/marketing/partners/${partnerId}/proposal`, { method: "POST" });
      const data = await res.json();
      if (data.proposal) {
        setProposalText(typeof data.proposal === "string" ? data.proposal : JSON.stringify(data.proposal, null, 2));
        setProposalCost(data.agentCost ?? null);
      }
    } catch { /* ignore */ }
    setProposalLoading(null);
  };

  const handleDelete = async (partnerId: string) => {
    if (!confirm(L.deleteConfirm)) return;
    setDeleteLoading(partnerId);
    try {
      await fetch(`/api/marketing/partners/${partnerId}`, { method: "DELETE" });
      setExpandedId(null);
      fetchPartners();
    } catch { /* ignore */ }
    setDeleteLoading(null);
  };

  const copyTrackingUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Unique countries for filter
  const countries = [...new Set(partners.map((p) => p.country).filter(Boolean))] as string[];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted" size={32} />
      </div>
    );
  }

  return (
    <section dir={dir} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Handshake size={18} className="text-[#89AACC]" /> {L.title}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-surface border border-stroke rounded-lg px-2 py-1 text-xs text-muted"
          >
            <option value="">{L.allTypes}</option>
            {PARTNER_TYPES.map((t) => (
              <option key={t} value={t}>{L.types[t] || t}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-surface border border-stroke rounded-lg px-2 py-1 text-xs text-muted"
          >
            <option value="">{L.allStatuses}</option>
            {AGREEMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{L.statuses[s] || s}</option>
            ))}
          </select>

          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="bg-surface border border-stroke rounded-lg px-2 py-1 text-xs text-muted"
          >
            <option value="">{L.allCountries}</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-lg bg-[#4E85BF] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d6fa3] flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} /> {L.addPartner}
          </button>

          <button
            onClick={fetchPartners}
            className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Workflow Explanation Card */}
      <div className="rounded-2xl border border-[#4E85BF]/20 bg-[#4E85BF]/5 p-5">
        <p className="text-sm font-semibold text-text-primary">{L.subtitle}</p>
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-muted">
          <span className="rounded-full bg-[#4E85BF]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#89AACC]">
            {L.addPartner}
          </span>
          <span>{dir === "rtl" ? "\u2190" : "\u2192"}</span>
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
            {L.generateQR}
          </span>
          <span>{dir === "rtl" ? "\u2190" : "\u2192"}</span>
          <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-purple-400">
            {L.workflowSendProposal}
          </span>
          <span>{dir === "rtl" ? "\u2190" : "\u2192"}</span>
          <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
            {L.workflowTrackReferrals}
          </span>
        </div>
      </div>

      {/* Partner Cards Grid */}
      {partners.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((partner) => {
              const typeColor = PARTNER_TYPE_COLORS[partner.partner_type] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
              const portalStatus = STATUS_TO_PORTAL[partner.agreement_status] || "not_configured";

              return (
                <button
                  key={partner.id}
                  onClick={() => handleExpand(partner.id)}
                  className={`rounded-2xl border bg-surface p-5 ${dir === "rtl" ? "text-right" : "text-left"} transition-colors ${
                    expandedId === partner.id
                      ? "border-[#4E85BF]/50"
                      : "border-stroke hover:border-[#4E85BF]/30"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className={`font-display text-sm font-bold truncate ${dir === "rtl" ? "pl-2" : "pr-2"}`}>
                      {partner.name}
                    </h4>
                    {expandedId === partner.id ? (
                      <ChevronUp size={14} className="text-muted shrink-0" />
                    ) : (
                      <ChevronDown size={14} className="text-muted shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${typeColor}`}>
                      {L.types[partner.partner_type] || partner.partner_type}
                    </span>
                    {partner.country && (
                      <span className="flex items-center gap-1 text-[11px] text-muted">
                        <Globe size={10} /> {partner.country}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <StatusBadge
                      status={portalStatus}
                      type="portal"
                      label={L.statuses[partner.agreement_status] || partner.agreement_status}
                    />
                    <div className="flex items-center gap-3 text-[11px] text-muted">
                      <span className="flex items-center gap-1">
                        <Users size={10} /> {partner.total_referrals ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp size={10} /> {partner.total_conversions ?? 0}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Expanded Detail Panel */}
          {expandedId && (() => {
            const partner = partners.find((p) => p.id === expandedId);
            if (!partner) return null;

            return (
              <div className="rounded-2xl border border-stroke bg-surface p-5 space-y-5">
                {/* Contact Info */}
                <div>
                  <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-3">
                    {partner.name}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {partner.contact_name && (
                      <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
                        <p className="text-[9px] text-muted uppercase">{L.contact}</p>
                        <p className="text-sm font-semibold">{partner.contact_name}</p>
                      </div>
                    )}
                    {partner.email && (
                      <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2 flex items-center gap-2">
                        <Mail size={12} className="text-muted shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] text-muted uppercase">{L.email}</p>
                          <p className="text-sm truncate">{partner.email}</p>
                        </div>
                      </div>
                    )}
                    {partner.phone && (
                      <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2 flex items-center gap-2">
                        <Phone size={12} className="text-muted shrink-0" />
                        <div>
                          <p className="text-[9px] text-muted uppercase">{L.phone}</p>
                          <p className="text-sm">{partner.phone}</p>
                        </div>
                      </div>
                    )}
                    {partner.whatsapp && (
                      <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2 flex items-center gap-2">
                        <MessageCircle size={12} className="text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-[9px] text-muted uppercase">{L.whatsapp}</p>
                          <p className="text-sm">{partner.whatsapp}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Agreement Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
                    <p className="text-[9px] text-muted uppercase">{L.agreement}</p>
                    <p className="text-sm font-semibold">{partner.agreement_type || L.notSet}</p>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
                    <p className="text-[9px] text-muted uppercase">{L.commission}</p>
                    <p className="text-sm font-semibold">{partner.commission_pct != null ? `${partner.commission_pct}%` : L.na}</p>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
                    <p className="text-[9px] text-muted uppercase">{L.referrals}</p>
                    <p className="text-sm font-semibold">{partner.total_referrals ?? 0}</p>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
                    <p className="text-[9px] text-muted uppercase">{L.conversions}</p>
                    <p className="text-sm font-semibold">{partner.total_conversions ?? 0}</p>
                  </div>
                </div>

                {partner.notes && (
                  <div className="rounded-lg bg-white/5 border border-stroke px-3 py-2">
                    <p className="text-[9px] text-muted uppercase">{L.notes}</p>
                    <p className="text-sm text-text-primary mt-1">{partner.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleGenerateQR(partner.id)}
                    disabled={qrLoading === partner.id}
                    className="rounded-lg border border-stroke px-3 py-1.5 text-xs font-medium text-muted hover:text-text-primary hover:bg-surface flex items-center gap-1.5 transition-colors"
                  >
                    {qrLoading === partner.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <QrCode size={12} />
                    )}
                    {L.generateQR}
                  </button>

                  <button
                    onClick={() => handleGenerateProposal(partner.id)}
                    disabled={proposalLoading === partner.id}
                    className="rounded-lg border border-stroke px-3 py-1.5 text-xs font-medium text-muted hover:text-text-primary hover:bg-surface flex items-center gap-1.5 transition-colors"
                  >
                    {proposalLoading === partner.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    {L.generateProposal}
                  </button>

                  <button
                    onClick={() => handleDelete(partner.id)}
                    disabled={deleteLoading === partner.id}
                    className={`rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 flex items-center gap-1.5 transition-colors ${dir === "rtl" ? "mr-auto" : "ml-auto"}`}
                  >
                    {deleteLoading === partner.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                    {L.delete}
                  </button>
                </div>

                {/* QR Code Result */}
                {qrResult && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                    <label className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">
                      {L.trackingUrl}
                    </label>
                    <div className="flex items-center gap-2">
                      <code dir="ltr" className="flex-1 bg-black/20 border border-stroke rounded-lg px-3 py-2 text-xs text-text-primary truncate text-left">
                        {qrResult.trackingUrl}
                      </code>
                      <button
                        onClick={() => copyTrackingUrl(qrResult.trackingUrl)}
                        className="rounded-lg border border-stroke px-3 py-1.5 text-xs font-medium text-muted hover:text-text-primary hover:bg-surface flex items-center gap-1.5 transition-colors shrink-0"
                      >
                        {copiedUrl ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copiedUrl ? L.copied : L.copy}
                      </button>
                    </div>
                    {qrResult.qrDataUrl && (
                      <div className="flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrResult.qrDataUrl}
                          alt="Partner QR Code"
                          className="w-48 h-48 rounded-lg border border-stroke"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* AI Proposal Result */}
                {proposalText && (
                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold text-purple-300 uppercase tracking-wider">
                        {L.aiProposal}
                      </label>
                      {proposalCost != null && (
                        <span className="text-[10px] text-muted">
                          {L.cost}: ${proposalCost.toFixed(4)}
                        </span>
                      )}
                    </div>
                    <div className="bg-black/20 border border-stroke rounded-lg px-4 py-3 text-sm text-text-primary leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                      {proposalText}
                    </div>
                  </div>
                )}

                {/* Referral History */}
                <div>
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                    {L.referralHistory}
                  </label>
                  {referralsLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 size={18} className="animate-spin text-muted" />
                    </div>
                  ) : referrals.length > 0 ? (
                    <div className="mt-2 space-y-1.5">
                      {referrals.map((ref) => (
                        <div
                          key={ref.id}
                          className="flex items-center justify-between bg-white/3 rounded-lg px-3 py-2 text-[11px]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-text-primary font-medium">
                              {ref.leads?.full_name || L.unknownLead}
                            </span>
                            {ref.referral_source && (
                              <span className="text-muted">{L.via} {ref.referral_source}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              ref.status === "converted"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : ref.status === "pending"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-zinc-500/10 text-zinc-400"
                            }`}>
                              {L.refStatuses[ref.status] || ref.status}
                            </span>
                            <span className="text-muted">
                              {new Date(ref.created_at).toLocaleDateString(dateLocale, { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted mt-2">{L.noReferrals}</p>
                  )}
                </div>
              </div>
            );
          })()}
        </>
      ) : (
        <div className="bg-surface rounded-2xl border border-stroke p-12 text-center">
          <Handshake size={40} className="mx-auto mb-4 text-muted/30" />
          <p className="text-muted font-semibold mb-1">{L.noPartners}</p>
          <p className="text-xs text-muted/70">{L.noPartnersHint}</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 rounded-lg bg-[#4E85BF] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d6fa3] inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} /> {L.addPartner}
          </button>
        </div>
      )}

      {/* Add Partner Modal */}
      {showAddModal && (
        <AddPartnerModal
          onClose={() => setShowAddModal(false)}
          onAdded={fetchPartners}
          L={L}
          dir={dir}
        />
      )}
    </section>
  );
}
