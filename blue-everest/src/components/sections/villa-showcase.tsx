"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { Ruler, BedDouble, Waves, Building2 } from "lucide-react";

export function VillaShowcase() {
  const { t } = useTranslation();

  const villas = [
    {
      ...t.villaShowcase.villaC,
      href: "/panglao-prime-villas/villa-c",
      image: "/images/exterior/villa-front-1.webp",
      available: true,
    },
    {
      ...t.villaShowcase.villaD,
      href: "/panglao-prime-villas/villa-d",
      image: "/images/exterior/villa-front-2.webp",
      available: true,
    },
  ];

  const specs = [
    { icon: Ruler, label: t.villaShowcase.specs.area },
    { icon: BedDouble, label: t.villaShowcase.specs.bedrooms },
    { icon: Waves, label: t.villaShowcase.specs.pool },
    { icon: Building2, label: t.villaShowcase.specs.stories },
  ];

  return (
    <section className="bg-cream py-20 px-[30px]">
      <div className="container-content">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="font-display text-[clamp(2rem,4vw,3.125rem)] mb-4">
              {t.villaShowcase.title}
            </h2>
            <p className="text-lg font-medium text-charcoal/80 max-w-2xl mx-auto">
              {t.villaShowcase.subtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {villas.map((villa, i) => (
            <ScrollReveal key={villa.name} delay={i * 0.15}>
              <div className="stat-card overflow-hidden group">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className="w-full h-full bg-cream-dark flex items-center justify-center text-gold-muted">
                    {/* Placeholder until images are optimized */}
                    <Image
                      src={villa.image}
                      alt={villa.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-2xl">{villa.name}</h3>
                    <span className="cta-badge text-sm px-4 py-2">
                      {villa.price}
                    </span>
                  </div>
                  <p className="text-charcoal/70 text-sm mb-6">{villa.tagline}</p>

                  {/* Specs */}
                  <ul className="flex flex-wrap gap-4 list-none p-0 m-0 mb-6">
                    {specs.map((spec) => (
                      <li key={spec.label} className="flex items-center gap-2 text-sm text-charcoal/80">
                        <spec.icon className="w-4 h-4 text-gold" />
                        {spec.label}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link href={villa.href} className="btn-gold-pill no-underline w-full block text-center">
                    <span className="btn-gold-pill-inner w-full">
                      {t.villaShowcase.viewDetails}
                    </span>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
