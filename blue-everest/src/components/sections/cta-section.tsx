"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { SITE_CONFIG } from "@/lib/config";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

export function CtaSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-charcoal py-20 px-[30px]">
      <div className="container-content text-center">
        <ScrollReveal>
          <h2 className="font-display text-[clamp(2rem,4vw,3.125rem)] text-white mb-4">
            {t.cta.title}
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10">
            {t.cta.subtitle}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href={SITE_CONFIG.whatsappLinks.marketing}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (typeof window !== "undefined") {
                  if (typeof (window as any).fbq === "function") {
                    (window as any).fbq("track", "Contact", { content_name: "WhatsApp Marketing CTA" });
                  }
                  if (typeof (window as any).gtag === "function") {
                    (window as any).gtag("event", "conversion", { send_to: "AW-18095957436/fRcuCImT9LQcELzL6bRD" });
                  }
                }
              }}
              className="btn-teal-pill no-underline"
            >
              <span className="btn-teal-pill-inner gap-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t.cta.whatsappMarketing}
              </span>
            </a>

            <span className="text-white/50 text-sm">{t.cta.or}</span>

            <a
              href={SITE_CONFIG.whatsappLinks.office}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (typeof window !== "undefined") {
                  if (typeof (window as any).fbq === "function") {
                    (window as any).fbq("track", "Contact", { content_name: "WhatsApp Office CTA" });
                  }
                  if (typeof (window as any).gtag === "function") {
                    (window as any).gtag("event", "conversion", { send_to: "AW-18095957436/fRcuCImT9LQcELzL6bRD" });
                  }
                }
              }}
              className="btn-gold-pill no-underline"
            >
              <span className="btn-gold-pill-inner gap-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t.cta.whatsappOffice}
              </span>
            </a>
          </div>

          <div className="mt-8">
            <Link
              href="/contact"
              className="text-white/60 hover:text-white text-sm no-underline transition-colors"
            >
              {t.cta.email}: {SITE_CONFIG.email}
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
