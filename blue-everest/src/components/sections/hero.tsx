"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { motion } from "framer-motion";

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-cream px-[30px]">
      <div className="container-wide relative min-h-[620px] rounded-[20px] overflow-hidden bg-charcoal">
        {/* Background image placeholder - will use actual render */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-ken-burns"
          style={{
            backgroundImage: "url('/images/exterior/hero-aerial.webp')",
            backgroundColor: "#2d2d44",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Hero content - glassmorphism card at bottom-left */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute start-10 sm:start-20 bottom-0 glass-card rounded-b-none border-b-0 p-5 max-w-[640px]"
        >
          <div
            className="rounded-[24px] rounded-b-none border border-white border-b-0 p-8 sm:p-[30px_60px_30px_60px] bg-cover bg-center"
            style={{
              backgroundImage: "linear-gradient(135deg, rgba(189,165,127,0.15), rgba(213,192,156,0.1))",
              backgroundColor: "#f9f7f3",
            }}
          >
            <h2 className="font-display text-charcoal text-[clamp(2rem,5vw,4.375rem)] leading-[100%] mb-4">
              <span className="block text-[clamp(1.5rem,3.5vw,3rem)] opacity-90">
                {t.hero.badge}
              </span>
              {t.hero.title}
            </h2>
            <p className="text-charcoal/90 text-lg sm:text-2xl font-medium leading-[100%] mb-0">
              {t.hero.subtitle.split(".")[0]}.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/panglao-prime-villas" className="btn-teal-pill no-underline">
                <span className="btn-teal-pill-inner text-sm sm:text-base">
                  {t.hero.cta}
                </span>
              </Link>
              <Link href="/investment" className="btn-gold-pill no-underline">
                <span className="btn-gold-pill-inner text-sm sm:text-base">
                  {t.hero.ctaSecondary}
                </span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Pre-sale badge at bottom-right */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="hidden lg:flex absolute end-20 bottom-0 glass-card rounded-b-none border-b-0 p-7 flex-col items-center gap-4 shadow-lg"
        >
          <p className="text-white text-sm uppercase font-semibold tracking-wider drop-shadow-md m-0">
            Verified Monthly Income
          </p>
          <p className="text-white text-2xl font-extrabold drop-shadow-md m-0">
            PHP 395,000
          </p>
          <p className="text-white text-sm uppercase font-semibold tracking-wider drop-shadow-md m-0">
            17-25% Annual ROI
          </p>
        </motion.div>
      </div>
    </section>
  );
}
