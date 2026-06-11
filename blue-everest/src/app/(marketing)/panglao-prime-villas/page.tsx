"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { SITE_CONFIG, INVESTMENT_DATA, VIRTUAL_TOURS } from "@/lib/config";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  MapPin,
  BarChart3,
  Home,
  Waves,
  BedDouble,
  Ruler,
  Building2,
  Phone,
  MessageCircle,
  Shield,
  Users,
  Star,
  ChevronRight,
  Globe,
  X,
  Play,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  VILLA HEADER                                                       */
/* ------------------------------------------------------------------ */

function VillaHeader() {
  const { t, locale, setLocale } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "#villas", label: t.nav.villas },
    { href: "#investment", label: t.nav.investment },
    { href: "#ownership", label: t.nav.ownership },
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <nav className="inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-black/60 px-3 py-2 gap-1 shadow-lg shadow-black/20">
        <Link href="/" className="flex items-center gap-2 px-2 no-underline shrink-0">
          <Image
            src="/images/brand/logo.webp"
            alt="Panglao Prime Villas"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="hidden sm:inline text-white/90 text-sm font-medium">
            Prime Villas
          </span>
        </Link>

        <ul className="hidden md:flex items-center list-none m-0 p-0 gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-white/70 text-sm font-medium no-underline px-3 py-2 rounded-full hover:text-white hover:bg-white/10 transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          onClick={() => setLocale(locale === "en" ? "he" : "en")}
          className="flex items-center gap-1 text-xs text-white/60 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors bg-transparent border-0 cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5" />
          {locale === "en" ? "עב" : "EN"}
        </button>

        <a
          href="https://primevilla.ph/#reserve"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 text-sm font-medium no-underline px-5 py-2 rounded-full accent-gradient text-white hover:opacity-90 transition-opacity"
        >
          {t.nav.reserve}
        </a>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1 p-2 bg-transparent border-0 cursor-pointer"
          aria-label="Menu"
        >
          <span className="block w-5 h-0.5 bg-white/70" />
          <span className="block w-5 h-0.5 bg-white/70" />
          <span className="block w-5 h-0.5 bg-white/70" />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full mt-2 left-4 right-4 bg-black/90 backdrop-blur-lg rounded-2xl border border-white/10 p-4 flex flex-col gap-2"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-white/80 no-underline px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              {link.label}
            </a>
          ))}
        </motion.div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  HERO SECTION                                                       */
/* ------------------------------------------------------------------ */

function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[100dvh] flex items-end pb-16 md:pb-24 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 25, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
      >
        <Image
          src="/images/exterior/hero-aerial.webp"
          alt="Panglao Prime Villas aerial view"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

      <div className="relative z-10 container-content w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs text-white/90 uppercase tracking-widest mb-6">
            {t.hero.badge}
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display italic leading-[0.95] text-white mb-6 max-w-4xl">
            {t.hero.title}
          </h1>

          <p className="text-white/70 max-w-2xl text-base sm:text-lg leading-relaxed mb-8">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#villas"
              className="no-underline px-7 py-3.5 rounded-full accent-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t.hero.cta}
            </a>
            <a
              href="#investment"
              className="no-underline px-7 py-3.5 rounded-full border border-white/20 text-white/90 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              {t.hero.ctaSecondary}
            </a>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[9px] text-white/20 uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-white/10 relative overflow-hidden">
          <div className="w-full h-3 accent-gradient animate-scroll-down" />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  STATS BAR                                                          */
/* ------------------------------------------------------------------ */

function StatsSection() {
  const { t } = useTranslation();

  const stats = [
    { icon: TrendingUp, value: t.stats.monthlyIncome, label: t.stats.monthlyIncomeLabel },
    { icon: BarChart3, value: t.stats.annualRoi, label: t.stats.annualRoiLabel },
    { icon: Home, value: t.stats.occupancy, label: t.stats.occupancyLabel },
    { icon: MapPin, value: t.stats.toBeach, label: t.stats.toBeachLabel },
  ];

  return (
    <section className="relative py-16 bg-surface border-y border-stroke">
      <div className="container-content">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="text-center p-6">
                <stat.icon className="w-6 h-6 mx-auto mb-3 text-[#89AACC]" />
                <div className="text-2xl sm:text-3xl font-display italic text-text-primary mb-1">
                  <AnimatedCounter value={stat.value} />
                </div>
                <p className="text-xs text-muted uppercase tracking-wider m-0">
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

/* ------------------------------------------------------------------ */
/*  VILLA SHOWCASE                                                     */
/* ------------------------------------------------------------------ */

function VillaShowcaseSection() {
  const { t } = useTranslation();

  const villas = [
    {
      ...t.villaShowcase.villaC,
      href: "https://primevilla.ph/#villas",
      images: [
        "/images/exterior/front-1.webp",
        "/images/interior/gf-living-1.webp",
        "/images/interior/3f-masters-1.webp",
      ],
    },
    {
      ...t.villaShowcase.villaD,
      href: "https://primevilla.ph/#villas",
      images: [
        "/images/exterior/front-2.webp",
        "/images/interior/gf-kitchen-1.webp",
        "/images/exterior/pd1.webp",
      ],
    },
  ];

  const specs = [
    { icon: Ruler, label: t.villaShowcase.specs.area },
    { icon: BedDouble, label: t.villaShowcase.specs.bedrooms },
    { icon: Waves, label: t.villaShowcase.specs.pool },
    { icon: Building2, label: t.villaShowcase.specs.stories },
  ];

  return (
    <section id="villas" className="py-20 px-6">
      <div className="container-content">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display italic mb-4">
              {t.villaShowcase.title}
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              {t.villaShowcase.subtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {villas.map((villa, i) => (
            <ScrollReveal key={villa.name} delay={i * 0.15}>
              <div className="group rounded-2xl border border-stroke overflow-hidden bg-surface hover:border-[#89AACC]/30 transition-colors">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={villa.images[0]}
                    alt={villa.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium text-white border border-white/10">
                    {villa.price}
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <h3 className="text-2xl font-display italic mb-2">{villa.name}</h3>
                  <p className="text-muted text-sm mb-6">{villa.tagline}</p>

                  <div className="flex flex-wrap gap-4 mb-6">
                    {specs.map((spec) => (
                      <span key={spec.label} className="flex items-center gap-2 text-xs text-muted">
                        <spec.icon className="w-4 h-4 text-[#89AACC]" />
                        {spec.label}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#89AACC] m-0">
                      {INVESTMENT_DATA.monthlyIncomeFormatted}/mo verified income
                    </p>
                    <a
                      href={villa.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline flex items-center gap-1 text-sm text-text-primary hover:text-[#89AACC] transition-colors"
                    >
                      {t.villaShowcase.viewDetails}
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  INVESTMENT PILLARS                                                 */
/* ------------------------------------------------------------------ */

function InvestmentSection() {
  const { t } = useTranslation();

  return (
    <section id="investment" className="py-20 px-6 bg-surface border-y border-stroke">
      <div className="container-content">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display italic mb-4">
              {t.investment.title}
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              {t.investment.subtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.investment.pillars.map((pillar, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="p-6 rounded-xl border border-stroke bg-bg hover:border-[#89AACC]/30 transition-colors h-full">
                <div className="w-10 h-10 rounded-full accent-gradient flex items-center justify-center text-white text-sm font-bold mb-4">
                  {i + 1}
                </div>
                <h3 className="text-lg font-display italic mb-3">{pillar.title}</h3>
                <p className="text-muted text-sm leading-relaxed m-0">
                  {pillar.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="text-center mt-12">
            <Link
              href="/panglao-prime-villas/investment"
              className="no-underline inline-flex items-center gap-2 px-7 py-3 rounded-full border border-stroke text-text-primary text-sm hover:border-[#89AACC]/50 hover:text-[#89AACC] transition-colors"
            >
              Full Investment Analysis
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  OWNERSHIP STRUCTURES PREVIEW                                       */
/* ------------------------------------------------------------------ */

function OwnershipPreview() {
  const { t } = useTranslation();

  const icons = [Shield, Users, Building2];

  return (
    <section id="ownership" className="py-20 px-6">
      <div className="container-content">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display italic mb-4">
              {t.ownershipPage.title}
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              {t.ownershipPage.subtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.ownershipPage.structures.map((structure, i) => {
            const Icon = icons[i];
            return (
              <ScrollReveal key={structure.name} delay={i * 0.1}>
                <div className="p-6 rounded-xl border border-stroke bg-surface hover:border-[#89AACC]/30 transition-colors h-full flex flex-col">
                  <Icon className="w-8 h-8 text-[#89AACC] mb-4" />
                  <h3 className="text-lg font-display italic mb-2">{structure.name}</h3>
                  <p className="text-muted text-sm mb-4 flex-1">{structure.description}</p>
                  <p className="text-xs text-[#89AACC] m-0">
                    Best for: {structure.bestFor}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="text-center mt-12">
            <Link
              href="/panglao-prime-villas/ownership"
              className="no-underline inline-flex items-center gap-2 px-7 py-3 rounded-full border border-stroke text-text-primary text-sm hover:border-[#89AACC]/50 hover:text-[#89AACC] transition-colors"
            >
              Full Ownership Guide
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  360 VIRTUAL TOUR GALLERY                                           */
/* ------------------------------------------------------------------ */

function TourModal({
  tour,
  onClose,
}: {
  tour: (typeof VIRTUAL_TOURS)[number];
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="text-white text-sm font-medium m-0">{tour.name}</p>
          <p className="text-white/40 text-xs m-0">{tour.location} - 360 Virtual Tour</p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border-0 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Iframe */}
      <div className="flex-1 p-2 sm:p-4" onClick={(e) => e.stopPropagation()}>
        <iframe
          src={tour.tourUrl}
          className="w-full h-full rounded-xl border-0"
          allow="fullscreen; gyroscope; accelerometer"
          allowFullScreen
        />
      </div>
    </motion.div>
  );
}

function VirtualTourGallery() {
  const [activeTour, setActiveTour] = useState<
    (typeof VIRTUAL_TOURS)[number] | null
  >(null);

  // Show featured tours (ones with images) first, then the rest
  const featured = VIRTUAL_TOURS.filter((t) => t.image);
  const others = VIRTUAL_TOURS.filter((t) => !t.image);
  const displayTours = [...featured, ...others].slice(0, 6);

  return (
    <section className="py-20 overflow-hidden border-y border-stroke bg-surface">
      <ScrollReveal>
        <div className="text-center mb-12 px-6">
          <p className="text-[10px] text-[#89AACC] uppercase tracking-[0.3em] mb-3">
            Interactive Experience
          </p>
          <h2 className="text-3xl sm:text-4xl font-display italic mb-4">
            360 Virtual Tours
          </h2>
          <p className="text-muted text-sm max-w-lg mx-auto">
            Step inside our completed projects. 13 immersive walkthrough experiences
            showcasing Blue Everest quality.
          </p>
        </div>
      </ScrollReveal>

      {/* Horizontal scroll cards */}
      <div className="flex gap-4 px-6 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
        {displayTours.map((tour, i) => (
          <ScrollReveal key={tour.id} delay={i * 0.08} direction="none">
            <button
              onClick={() => setActiveTour(tour)}
              className="relative w-[260px] sm:w-[300px] aspect-[4/3] rounded-xl overflow-hidden shrink-0 group border-0 p-0 cursor-pointer bg-surface"
            >
              {tour.image ? (
                <Image
                  src={tour.image}
                  alt={tour.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="300px"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#89AACC]/20 to-[#4E85BF]/10 flex items-center justify-center">
                  <span className="text-4xl font-display italic text-white/20">
                    {tour.name[0]}
                  </span>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors" />

              {/* 360 badge */}
              <div className="absolute top-3 right-3 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                <span className="text-[10px] text-white font-medium tracking-wider">
                  360°
                </span>
              </div>

              {/* Play indicator */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <Play className="w-6 h-6 text-white ml-0.5" />
                </div>
              </div>

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white text-sm font-medium m-0 text-left">
                  {tour.name}
                </p>
                <p className="text-white/50 text-xs m-0 text-left">{tour.location}</p>
              </div>
            </button>
          </ScrollReveal>
        ))}

        {/* "View all" card */}
        <ScrollReveal delay={0.5} direction="none">
          <Link
            href="/panglao-prime-villas/tours"
            className="no-underline relative w-[200px] sm:w-[240px] aspect-[4/3] rounded-xl overflow-hidden shrink-0 flex flex-col items-center justify-center border border-stroke hover:border-[#89AACC]/30 transition-colors bg-bg group"
          >
            <div className="w-12 h-12 rounded-full border border-stroke group-hover:border-[#89AACC]/50 flex items-center justify-center mb-3 transition-colors">
              <ChevronRight className="w-5 h-5 text-muted group-hover:text-[#89AACC] transition-colors" />
            </div>
            <p className="text-text-primary text-sm font-medium m-0">
              All 13 Tours
            </p>
            <p className="text-muted text-xs m-0">View collection</p>
          </Link>
        </ScrollReveal>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeTour && (
          <TourModal tour={activeTour} onClose={() => setActiveTour(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  VIDEO SHOWCASE - Panglao Prime Villas                              */
/* ------------------------------------------------------------------ */

function VideoShowcase() {
  return (
    <section className="relative py-0 overflow-hidden">
      {/* Full-width cinematic video */}
      <div className="relative h-[70vh] sm:h-[80vh] overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="/images/portfolio/4-storey-pampanga-2.webp"
        >
          <source src="/videos/villa-overview.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/60" />
        <div className="absolute inset-0 bg-black/20" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <ScrollReveal>
            <div className="text-center px-6">
              <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] mb-4">
                Our Portfolio
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display italic text-white leading-[0.95] mb-4">
                Building<br />Excellence
              </h2>
              <p className="text-white/50 text-sm sm:text-base max-w-md mx-auto">
                From luxury villas to multi-storey developments.
                Blue Everest delivers investment-grade properties across the Philippines.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA / CONTACT SECTION                                              */
/* ------------------------------------------------------------------ */

function CTASection() {
  const { t } = useTranslation();
  const [formState, setFormState] = useState<"idle" | "sending" | "sent">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    villa: "either",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (!formData.email.trim() && !formData.phone.trim()) {
      alert("Please provide your email or phone number so we can reach you.");
      return;
    }
    setFormState("sending");
    try {
      const res = await fetch("/api/marketing/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          nationality: formData.country,
          villa_interest: formData.villa,
          purpose: formData.message,
          source: "blue-everest.com",
          market: formData.country?.toLowerCase().includes("israel") || formData.country?.toLowerCase().includes("il") ? "IL" : "PH",
        }),
      });
      if (!res.ok) throw new Error("Submit failed");
      setFormState("sent");
      // Meta Pixel Lead event
      if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
        (window as any).fbq("track", "Lead", {
          content_name: "Panglao Prime Villas Inquiry",
          villa_interest: formData.villa,
        });
      }
      // Google Ads conversion
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

  return (
    <section id="contact" className="py-20 px-6">
      <div className="container-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Info */}
          <ScrollReveal>
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display italic mb-6">
                {t.cta.title}
              </h2>
              <p className="text-muted text-lg mb-10">
                {t.cta.subtitle}
              </p>

              <div className="space-y-4">
                <a
                  href={SITE_CONFIG.whatsappLinks.marketing}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      if (typeof (window as any).fbq === "function") {
                        (window as any).fbq("track", "Contact", { content_name: "WhatsApp Marketing" });
                      }
                      if (typeof (window as any).gtag === "function") {
                        (window as any).gtag("event", "conversion", { send_to: "AW-18095957436/fRcuCImT9LQcELzL6bRD" });
                      }
                    }
                  }}
                  className="no-underline flex items-center gap-4 p-4 rounded-xl border border-stroke hover:border-[#25D366]/50 hover:bg-[#25D366]/5 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium m-0">
                      {t.cta.whatsappMarketing}
                    </p>
                    <p className="text-muted text-xs m-0">+639542555553</p>
                  </div>
                </a>

                <a
                  href={SITE_CONFIG.whatsappLinks.office}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      if (typeof (window as any).fbq === "function") {
                        (window as any).fbq("track", "Contact", { content_name: "WhatsApp Office" });
                      }
                      if (typeof (window as any).gtag === "function") {
                        (window as any).gtag("event", "conversion", { send_to: "AW-18095957436/fRcuCImT9LQcELzL6bRD" });
                      }
                    }
                  }}
                  className="no-underline flex items-center gap-4 p-4 rounded-xl border border-stroke hover:border-[#25D366]/50 hover:bg-[#25D366]/5 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium m-0">
                      {t.cta.whatsappOffice}
                    </p>
                    <p className="text-muted text-xs m-0">+639958565865</p>
                  </div>
                </a>

                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="no-underline flex items-center gap-4 p-4 rounded-xl border border-stroke hover:border-[#89AACC]/50 hover:bg-[#89AACC]/5 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full accent-gradient flex items-center justify-center shrink-0">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium m-0">{t.cta.email}</p>
                    <p className="text-muted text-xs m-0">{SITE_CONFIG.email}</p>
                  </div>
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* Right: Form */}
          <ScrollReveal delay={0.2}>
            <div className="bg-surface rounded-2xl border border-stroke p-6 sm:p-8">
              <h3 className="text-xl font-display italic mb-6">{t.contactPage.title}</h3>

              {formState === "sent" ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full accent-gradient flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-text-primary font-medium mb-2">
                    {t.contactPage.form.success}
                  </p>
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
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FOOTER                                                             */
/* ------------------------------------------------------------------ */

function VillaFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-stroke py-12 px-6">
      <div className="container-content">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="text-sm font-medium mb-4">{t.footer.company}</h4>
            <p className="text-muted text-xs leading-relaxed m-0">{t.footer.tagline}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-4">{t.footer.quickLinks}</h4>
            <ul className="list-none p-0 m-0 space-y-2">
              <li><a href="#villas" className="text-muted text-xs no-underline hover:text-text-primary transition-colors">{t.nav.villas}</a></li>
              <li><a href="#investment" className="text-muted text-xs no-underline hover:text-text-primary transition-colors">{t.nav.investment}</a></li>
              <li><a href="#ownership" className="text-muted text-xs no-underline hover:text-text-primary transition-colors">{t.nav.ownership}</a></li>
              <li><a href="#contact" className="text-muted text-xs no-underline hover:text-text-primary transition-colors">{t.nav.contact}</a></li>
              <li><Link href="/chat" className="text-muted text-xs no-underline hover:text-text-primary transition-colors">AI Assistant</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-4">{t.footer.contactUs}</h4>
            <div className="space-y-2">
              <p className="text-muted text-xs m-0">{t.footer.whatsappMarketing}</p>
              <p className="text-muted text-xs m-0">{t.footer.whatsappOffice}</p>
              <p className="text-muted text-xs m-0">{SITE_CONFIG.email}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-stroke pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted/50 text-xs m-0">
            &copy; {new Date().getFullYear()} {t.footer.copyright}
          </p>
          <p className="text-muted/40 text-[10px] max-w-lg text-center sm:text-right m-0">
            {t.footer.disclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  WHATSAPP FAB                                                       */
/* ------------------------------------------------------------------ */

function WhatsAppButton() {
  return (
    <a
      href={SITE_CONFIG.whatsappLinks.marketing}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 end-6 z-50 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 no-underline"
      aria-label="Contact via WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
}

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */

export default function PrimeVillaHome() {
  return (
    <>
      <VillaHeader />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <VillaShowcaseSection />
        <InvestmentSection />
        <OwnershipPreview />
        <VirtualTourGallery />
        <VideoShowcase />
        <CTASection />
      </main>
      <VillaFooter />
      <WhatsAppButton />
    </>
  );
}
