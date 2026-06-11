"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { SITE_CONFIG } from "@/lib/config";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import {
  ChevronLeft,
  Globe,
  MessageCircle,
  Phone,
  Star,
  CheckCircle,
} from "lucide-react";

export default function BookPage() {
  const { t, locale, setLocale } = useTranslation();
  const [formState, setFormState] = useState<"idle" | "sending" | "sent">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    villa: "either",
    timeline: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("sending");
    try {
      const response = await fetch("/api/marketing/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          nationality: formData.country,
          villa_interest: formData.villa,
          purpose: formData.message,
          source: "blue-everest.com/panglao-prime-villas/book",
          market: formData.country.toLowerCase().includes("israel") ? "IL" : "PH",
          raw_data: {
            timeline: formData.timeline,
          },
        }),
      });
      if (!response.ok) throw new Error("Submit failed");
      setFormState("sent");
      if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
        (window as any).fbq("track", "Lead", {
          content_name: "Panglao Prime Villas Booking Inquiry",
          villa_interest: formData.villa,
        });
      }
      // Google Ads conversion tracking
      if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
        (window as any).gtag("event", "conversion", {
          send_to: "AW-18095957436/fRcuCImT9LQcELzL6bRD",
          value: 1.0,
          currency: "PHP",
        });
      }
    } catch {
      setFormState("idle");
    }
  };

  const steps = t.ownershipPage.processSteps;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
        <nav className="inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-black/60 px-3 py-2 gap-2">
          <Link href="/panglao-prime-villas" className="flex items-center gap-2 text-white/70 text-sm no-underline px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Home
          </Link>
          <button
            onClick={() => setLocale(locale === "en" ? "he" : "en")}
            className="flex items-center gap-1 text-xs text-white/60 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors bg-transparent border-0 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            {locale === "en" ? "עב" : "EN"}
          </button>
        </nav>
      </header>

      <main className="pt-24 pb-20 px-6">
        <div className="container-content max-w-4xl">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display italic mb-4">
                {t.contactPage.title}
              </h1>
              <p className="text-muted text-lg max-w-xl mx-auto">
                {t.contactPage.subtitle}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3">
              <ScrollReveal>
                <div className="rounded-2xl border border-stroke bg-surface p-6 sm:p-8">
                  {formState === "sent" ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 rounded-full accent-gradient flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-display italic mb-2">
                        {t.contactPage.form.success}
                      </h3>
                      <div className="flex flex-wrap justify-center gap-3 mt-6">
                        <a
                          href={SITE_CONFIG.whatsappLinks.marketing}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="no-underline flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp: +639542555553
                        </a>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <input
                        type="text"
                        placeholder={t.contactPage.form.name}
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-bg border border-stroke text-text-primary placeholder:text-muted text-sm focus:outline-none focus:border-[#89AACC]"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="email"
                          placeholder={t.contactPage.form.email}
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-bg border border-stroke text-text-primary placeholder:text-muted text-sm focus:outline-none focus:border-[#89AACC]"
                        />
                        <input
                          type="tel"
                          placeholder={t.contactPage.form.phone}
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-bg border border-stroke text-text-primary placeholder:text-muted text-sm focus:outline-none focus:border-[#89AACC]"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder={t.contactPage.form.country}
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-bg border border-stroke text-text-primary placeholder:text-muted text-sm focus:outline-none focus:border-[#89AACC]"
                      />
                      <select
                        value={formData.villa}
                        onChange={(e) => setFormData({ ...formData, villa: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-bg border border-stroke text-text-primary text-sm focus:outline-none focus:border-[#89AACC]"
                      >
                        <option value="either">{t.contactPage.form.either}</option>
                        <option value="villa-c">{t.contactPage.form.villaC}</option>
                        <option value="villa-d">{t.contactPage.form.villaD}</option>
                      </select>
                      <input
                        type="text"
                        placeholder={t.contactPage.form.timeline}
                        value={formData.timeline}
                        onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-bg border border-stroke text-text-primary placeholder:text-muted text-sm focus:outline-none focus:border-[#89AACC]"
                      />
                      <textarea
                        placeholder={t.contactPage.form.message}
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-bg border border-stroke text-text-primary placeholder:text-muted text-sm focus:outline-none focus:border-[#89AACC] resize-none"
                      />
                      <button
                        type="submit"
                        disabled={formState === "sending"}
                        className="w-full py-3.5 rounded-full accent-gradient text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 border-0 cursor-pointer"
                      >
                        {formState === "sending"
                          ? t.contactPage.form.submitting
                          : t.contactPage.form.submit}
                      </button>
                    </form>
                  )}
                </div>
              </ScrollReveal>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <ScrollReveal delay={0.1}>
                <div className="rounded-2xl border border-stroke bg-surface p-6">
                  <h3 className="text-sm font-medium mb-4">Contact Directly</h3>
                  <div className="space-y-3">
                    <a
                      href={SITE_CONFIG.whatsappLinks.marketing}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline flex items-center gap-3 p-3 rounded-xl border border-stroke hover:border-[#25D366]/50 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 text-[#25D366]" />
                      <div>
                        <p className="text-sm text-text-primary m-0">+639542555553</p>
                        <p className="text-xs text-muted m-0">Marketing</p>
                      </div>
                    </a>
                    <a
                      href={SITE_CONFIG.whatsappLinks.office}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline flex items-center gap-3 p-3 rounded-xl border border-stroke hover:border-[#25D366]/50 transition-colors"
                    >
                      <Phone className="w-5 h-5 text-[#25D366]" />
                      <div>
                        <p className="text-sm text-text-primary m-0">+639958565865</p>
                        <p className="text-xs text-muted m-0">Office</p>
                      </div>
                    </a>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <div className="rounded-2xl border border-stroke bg-surface p-6">
                  <h3 className="text-sm font-medium mb-4">{t.ownershipPage.process}</h3>
                  <ol className="list-none p-0 m-0 space-y-3">
                    {steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-surface border border-stroke flex items-center justify-center text-xs text-muted shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-muted">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </main>

      {/* WhatsApp FAB */}
      <a
        href={SITE_CONFIG.whatsappLinks.marketing}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 end-6 z-50 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 no-underline"
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </>
  );
}
