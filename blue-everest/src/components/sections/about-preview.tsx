"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { Shield, Target, Award } from "lucide-react";

export function AboutPreview() {
  const { t } = useTranslation();

  const highlights = [
    {
      icon: Shield,
      titleEn: "End-to-End Service",
      titleHe: "שירות מקצה לקצה",
      descEn: "From acquisition through property management, we handle everything so you can focus on returns.",
      descHe: "מרכישה ועד ניהול נכסים, אנו מטפלים בהכל כדי שתוכלו להתמקד בתשואה.",
    },
    {
      icon: Target,
      titleEn: "Verified Performance",
      titleHe: "ביצועים מאומתים",
      descEn: "PHP 395,000/month verified Airbnb income. 65% occupancy rate vs 49% market average.",
      descHe: "הכנסה חודשית מאומתת של 395,000 פזו מ-Airbnb. תפוסה של 65% מול ממוצע שוק של 49%.",
    },
    {
      icon: Award,
      titleEn: "Premium Locations",
      titleHe: "מיקומי פרמיום",
      descEn: "Between JW Marriott and Mithi Resort, 60 seconds to Panglao Beach. Infrastructure-backed appreciation.",
      descHe: "בין JW Marriott ל-Mithi Resort, 60 שניות מחוף פנגלאו. עליית ערך מגובת תשתיות.",
    },
  ];

  return (
    <section className="bg-cream py-20 px-[30px]">
      <div className="container-content">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="font-display text-[clamp(2rem,4vw,3.125rem)] mb-4">
              {t.aboutPage.title}
            </h2>
            <p className="text-lg text-charcoal/80 max-w-2xl mx-auto">
              {t.aboutPage.subtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-cream-card flex items-center justify-center mx-auto mb-6 border border-cream-border">
                  <item.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="font-display text-xl mb-3">
                  {t.nav.home === "Home" ? item.titleEn : item.titleHe}
                </h3>
                <p className="text-sm text-charcoal/70 leading-relaxed">
                  {t.nav.home === "Home" ? item.descEn : item.descHe}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="text-center mt-12">
            <Link href="/about" className="btn-gold-pill no-underline">
              <span className="btn-gold-pill-inner">
                {t.common.learnMore}
              </span>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
