"use client";

import { useTranslation } from "@/lib/i18n";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { Globe, Users, Plane, Landmark, Building, Hotel } from "lucide-react";

const pillarIcons = [Globe, Users, Plane, Landmark, Building, Hotel];

export function InvestmentPillars() {
  const { t } = useTranslation();

  return (
    <section className="bg-cream-dark py-20 px-[30px]">
      <div className="container-content">
        <ScrollReveal>
          <div className="text-center mb-6">
            <span className="cta-badge inline-block mb-6">
              {t.common.verifiedIncome}
            </span>
            <h2 className="font-display text-[clamp(2rem,4vw,3.125rem)] mb-4">
              {t.investment.title}
            </h2>
            <p className="text-lg font-medium text-charcoal/80 max-w-2xl mx-auto">
              {t.investment.subtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {t.investment.pillars.map((pillar, i) => {
            const Icon = pillarIcons[i] || Globe;
            return (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className={`invest-card h-full ${i % 2 === 0 ? "bg-cream-dark" : "bg-cream-card"}`}>
                  <div className="w-14 h-14 rounded-full bg-cream flex items-center justify-center mx-auto mb-6 border border-cream-border">
                    <Icon className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="font-display text-xl mb-3">{pillar.title}</h3>
                  <p className="text-sm text-charcoal/70 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
