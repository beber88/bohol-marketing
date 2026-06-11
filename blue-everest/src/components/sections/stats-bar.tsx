"use client";

import { useTranslation } from "@/lib/i18n";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { TrendingUp, Home, BarChart3, MapPin } from "lucide-react";

export function StatsBar() {
  const { t } = useTranslation();

  const stats = [
    {
      icon: TrendingUp,
      value: t.stats.monthlyIncome,
      label: t.stats.monthlyIncomeLabel,
    },
    {
      icon: BarChart3,
      value: t.stats.annualRoi,
      label: t.stats.annualRoiLabel,
    },
    {
      icon: Home,
      value: t.stats.occupancy,
      label: t.stats.occupancyLabel,
    },
    {
      icon: MapPin,
      value: t.stats.toBeach,
      label: t.stats.toBeachLabel,
    },
  ];

  return (
    <section className="bg-cream py-16 px-[30px]">
      <div className="container-wide">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="stat-card relative text-center pt-16 pb-8 px-4 sm:px-8">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-cream-card rounded-full flex items-center justify-center border border-cream-border shadow-sm">
                  <stat.icon className="w-8 h-8 text-gold" />
                </div>
                <div className="text-2xl sm:text-[40px] font-bold text-charcoal mb-2 font-sans">
                  <AnimatedCounter value={stat.value} />
                </div>
                <p className="text-sm font-bold text-charcoal/80 m-0 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
