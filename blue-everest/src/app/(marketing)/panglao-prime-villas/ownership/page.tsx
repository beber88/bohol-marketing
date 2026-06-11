"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { SITE_CONFIG } from "@/lib/config";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import {
  ChevronLeft,
  Globe,
  MessageCircle,
  Phone,
  Shield,
  Users,
  Building2,
  CheckCircle,
} from "lucide-react";

export default function OwnershipPage() {
  const { t, locale, setLocale } = useTranslation();

  const icons = [Shield, Users, Building2];

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
          <a
            href="#contact"
            className="text-sm font-medium no-underline px-5 py-2 rounded-full accent-gradient text-white hover:opacity-90 transition-opacity"
          >
            {t.nav.reserve}
          </a>
        </nav>
      </header>

      <main className="pt-24 pb-20 px-6">
        <div className="container-content">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display italic mb-4">
                {t.ownershipPage.title}
              </h1>
              <p className="text-muted text-lg max-w-2xl mx-auto">
                {t.ownershipPage.subtitle}
              </p>
            </div>
          </ScrollReveal>

          {/* Ownership Structures */}
          <div className="space-y-8 mb-16">
            {t.ownershipPage.structures.map((structure, i) => {
              const Icon = icons[i];
              return (
                <ScrollReveal key={structure.name} delay={i * 0.1}>
                  <div className="rounded-2xl border border-stroke bg-surface p-6 sm:p-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full accent-gradient flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-display italic m-0 mb-1">
                          {structure.name}
                        </h2>
                        <p className="text-xs text-[#89AACC] m-0">
                          Best for: {structure.bestFor}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted text-sm mb-6">{structure.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {structure.advantages.map((adv) => (
                        <div key={adv} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#89AACC] shrink-0 mt-0.5" />
                          <span className="text-sm text-text-primary">{adv}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Purchase Process */}
          <ScrollReveal>
            <div className="rounded-2xl border border-stroke bg-surface p-6 sm:p-8 mb-16">
              <h2 className="text-2xl font-display italic mb-8 text-center">
                {t.ownershipPage.process}
              </h2>
              <div className="max-w-2xl mx-auto">
                {t.ownershipPage.processSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-4 mb-6 last:mb-0">
                    <div className="w-8 h-8 rounded-full accent-gradient flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="pt-1">
                      <p className="text-sm text-text-primary m-0">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Bottom CTA */}
          <div id="contact" className="text-center">
            <h3 className="text-xl font-display italic mb-4">{t.cta.title}</h3>
            <p className="text-muted text-sm mb-6">{t.cta.subtitle}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={SITE_CONFIG.whatsappLinks.marketing}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white text-sm font-medium hover:bg-[#20BD5A] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp: +639542555553
              </a>
              <a
                href={SITE_CONFIG.whatsappLinks.office}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline flex items-center gap-2 px-6 py-3 rounded-full border border-stroke text-text-primary text-sm hover:border-[#89AACC]/50 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Office: +639958565865
              </a>
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
