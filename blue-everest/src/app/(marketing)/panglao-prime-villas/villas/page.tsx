"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { SITE_CONFIG, VILLA_DATA, INVESTMENT_DATA } from "@/lib/config";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import {
  Ruler,
  BedDouble,
  Waves,
  Building2,
  ChevronLeft,
  MessageCircle,
  Phone,
  Globe,
} from "lucide-react";

const EXTERIOR_IMAGES = [
  { src: "/images/exterior/hero-aerial.webp", label: "Aerial View" },
  { src: "/images/exterior/front-1.webp", label: "Front Elevation" },
  { src: "/images/exterior/front-2.webp", label: "Front View 2" },
  { src: "/images/exterior/rear-1.webp", label: "Rear View" },
  { src: "/images/exterior/panglao-rear.webp", label: "Rear Perspective" },
  { src: "/images/exterior/pd1.webp", label: "Pool Deck" },
  { src: "/images/exterior/pd2.webp", label: "Pool Deck 2" },
  { src: "/images/exterior/rd1.webp", label: "Roof Deck" },
];

const INTERIOR_IMAGES = [
  { src: "/images/interior/gf-living-1.webp", label: "Living Room" },
  { src: "/images/interior/gf-living-2.webp", label: "Living Room 2" },
  { src: "/images/interior/gf-kitchen-1.webp", label: "Kitchen" },
  { src: "/images/interior/gf-kitchen-2.webp", label: "Kitchen 2" },
  { src: "/images/interior/gf-dining-1.webp", label: "Dining" },
  { src: "/images/interior/gf-foyer-1.webp", label: "Foyer" },
  { src: "/images/interior/3f-masters-1.webp", label: "Master Suite" },
  { src: "/images/interior/3f-ensuite-1a.webp", label: "Master Ensuite" },
  { src: "/images/interior/2f-guest-1.webp", label: "Guest Bedroom" },
  { src: "/images/interior/gf-powder-room-1.webp", label: "Powder Room" },
];

function VillaDetailCard({
  name,
  price,
  id,
}: {
  name: string;
  price: string;
  id: string;
}) {
  const { t } = useTranslation();

  const specs = [
    { icon: Ruler, label: "263.78 sqm", detail: t.villaDetail.floorArea },
    { icon: Building2, label: "3 Storeys + Roof Deck", detail: t.villaDetail.stories },
    { icon: BedDouble, label: "4 En-Suite", detail: t.villaDetail.bedrooms },
    { icon: Waves, label: "15.08 sqm + Jacuzzi", detail: t.villaDetail.pool },
  ];

  return (
    <div id={id} className="scroll-mt-24">
      <div className="rounded-2xl border border-stroke bg-surface overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-stroke">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl sm:text-3xl font-display italic m-0">{name}</h2>
            <span className="text-lg sm:text-xl font-display italic text-[#89AACC]">
              {price}
            </span>
          </div>
          <p className="text-[#89AACC] text-sm m-0">
            {t.villaDetail.monthlyIncome} - {t.villaDetail.annualRoi}
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <h3 className="text-lg font-display italic mb-4">{t.villaDetail.specifications}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {specs.map((spec) => (
              <div key={spec.detail} className="p-4 rounded-xl bg-bg border border-stroke text-center">
                <spec.icon className="w-5 h-5 mx-auto mb-2 text-[#89AACC]" />
                <p className="text-sm font-medium text-text-primary m-0">{spec.label}</p>
                <p className="text-xs text-muted m-0 mt-1">{spec.detail}</p>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-display italic mb-4">Features</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none p-0 m-0 mb-8">
            {t.villaDetail.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                <span className="text-[#89AACC] mt-0.5">&#10003;</span>
                {feature}
              </li>
            ))}
          </ul>

          <div className="p-4 rounded-xl bg-bg border border-stroke mb-6">
            <h4 className="text-sm font-medium mb-2">{t.villaDetail.investmentSnapshot}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted text-xs m-0">Monthly Income</p>
                <p className="text-text-primary font-medium m-0">{INVESTMENT_DATA.monthlyIncomeFormatted}</p>
              </div>
              <div>
                <p className="text-muted text-xs m-0">Annual ROI</p>
                <p className="text-text-primary font-medium m-0">{INVESTMENT_DATA.annualRoi}</p>
              </div>
              <div>
                <p className="text-muted text-xs m-0">Occupancy</p>
                <p className="text-text-primary font-medium m-0">{INVESTMENT_DATA.occupancy}</p>
              </div>
              <div>
                <p className="text-muted text-xs m-0">Reservation Fee</p>
                <p className="text-text-primary font-medium m-0">PHP 200,000</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted mb-6 m-0">{t.villaDetail.financing}</p>

          <div className="flex flex-wrap gap-3">
            <a
              href={SITE_CONFIG.whatsappLinks.marketing}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white text-sm font-medium hover:bg-[#20BD5A] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t.villaDetail.reserveNow}
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
    </div>
  );
}

export default function VillasPage() {
  const { t, locale, setLocale } = useTranslation();
  const [activeTab, setActiveTab] = useState<"exterior" | "interior">("exterior");
  const images = activeTab === "exterior" ? EXTERIOR_IMAGES : INTERIOR_IMAGES;

  return (
    <>
      {/* Nav */}
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
          {/* Title */}
          <ScrollReveal>
            <div className="text-center mb-16">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display italic mb-4">
                {t.villaShowcase.title}
              </h1>
              <p className="text-muted text-lg max-w-2xl mx-auto">
                {t.villaShowcase.subtitle}
              </p>
            </div>
          </ScrollReveal>

          {/* Villa Cards */}
          <div className="space-y-12 mb-20">
            <ScrollReveal>
              <VillaDetailCard
                name={t.villaShowcase.villaC.name}
                price={t.villaShowcase.villaC.price}
                id="villa-c"
              />
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <VillaDetailCard
                name={t.villaShowcase.villaD.name}
                price={t.villaShowcase.villaD.price}
                id="villa-d"
              />
            </ScrollReveal>
          </div>

          {/* Gallery */}
          <ScrollReveal>
            <div id="gallery" className="mb-16">
              <h2 className="text-2xl sm:text-3xl font-display italic text-center mb-8">
                {t.villaDetail.gallery}
              </h2>

              <div className="flex justify-center gap-2 mb-8">
                <button
                  onClick={() => setActiveTab("exterior")}
                  className={`px-5 py-2 rounded-full text-sm border-0 cursor-pointer transition-colors ${
                    activeTab === "exterior"
                      ? "accent-gradient text-white"
                      : "bg-surface border border-stroke text-muted hover:text-text-primary"
                  }`}
                >
                  {t.villaDetail.exterior}
                </button>
                <button
                  onClick={() => setActiveTab("interior")}
                  className={`px-5 py-2 rounded-full text-sm border-0 cursor-pointer transition-colors ${
                    activeTab === "interior"
                      ? "accent-gradient text-white"
                      : "bg-surface border border-stroke text-muted hover:text-text-primary"
                  }`}
                >
                  {t.villaDetail.interior}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div key={img.src} className="relative aspect-[4/3] rounded-xl overflow-hidden group">
                    <Image
                      src={img.src}
                      alt={img.label}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="absolute bottom-2 left-3 text-white text-xs font-medium m-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {img.label}
                    </p>
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
