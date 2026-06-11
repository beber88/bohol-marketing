"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SITE_CONFIG, VIRTUAL_TOURS } from "@/lib/config";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  X,
  Play,
  MessageCircle,
  Phone,
} from "lucide-react";

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
      <div
        className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="text-white text-sm font-medium m-0">{tour.name}</p>
          <p className="text-white/40 text-xs m-0">
            {tour.location} - 360 Virtual Tour
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border-0 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

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

export default function ToursPage() {
  const [activeTour, setActiveTour] = useState<
    (typeof VIRTUAL_TOURS)[number] | null
  >(null);

  const withImages = VIRTUAL_TOURS.filter((t) => t.image);
  const withoutImages = VIRTUAL_TOURS.filter((t) => !t.image);

  return (
    <>
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
        <nav className="inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-black/60 px-3 py-2 gap-2">
          <Link
            href="/panglao-prime-villas"
            className="flex items-center gap-2 text-white/70 text-sm no-underline px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Home
          </Link>
          <span className="text-white/30 text-sm">|</span>
          <span className="text-white/70 text-sm px-2">
            360 Tours
          </span>
        </nav>
      </header>

      <main className="pt-24 pb-20 px-6">
        <div className="container-content">
          {/* Header */}
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-[10px] text-[#89AACC] uppercase tracking-[0.3em] mb-3">
                Interactive Experience
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display italic mb-4">
                Virtual Tours
              </h1>
              <p className="text-muted text-lg max-w-2xl mx-auto">
                Explore completed Blue Everest projects in immersive 360.
                Click any project to step inside.
              </p>
            </div>
          </ScrollReveal>

          {/* Featured tours (with images) */}
          {withImages.length > 0 && (
            <div className="mb-12">
              <ScrollReveal>
                <h2 className="text-lg font-display italic mb-6 text-muted">
                  Featured Projects
                </h2>
              </ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {withImages.map((tour, i) => (
                  <ScrollReveal key={tour.id} delay={i * 0.1}>
                    <button
                      onClick={() => setActiveTour(tour)}
                      className="relative w-full aspect-[16/10] rounded-xl overflow-hidden group border-0 p-0 cursor-pointer bg-surface"
                    >
                      <Image
                        src={tour.image!}
                        alt={tour.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors" />

                      {/* 360 badge */}
                      <div className="absolute top-3 right-3 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                        <span className="text-[10px] text-white font-medium tracking-wider">
                          360°
                        </span>
                      </div>

                      {/* Play */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                          <Play className="w-7 h-7 text-white ml-0.5" />
                        </div>
                      </div>

                      {/* Label */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white text-base font-medium m-0 text-left">
                          {tour.name}
                        </p>
                        <p className="text-white/50 text-xs m-0 text-left">
                          {tour.location}
                        </p>
                      </div>
                    </button>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}

          {/* All other tours */}
          <ScrollReveal>
            <h2 className="text-lg font-display italic mb-6 text-muted">
              All Projects
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {withoutImages.map((tour, i) => (
              <ScrollReveal key={tour.id} delay={i * 0.05}>
                <button
                  onClick={() => setActiveTour(tour)}
                  className="relative w-full aspect-[16/10] rounded-xl overflow-hidden group border border-stroke p-0 cursor-pointer bg-surface hover:border-[#89AACC]/30 transition-colors"
                >
                  {/* Gradient placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#89AACC]/10 to-[#4E85BF]/5 flex items-center justify-center">
                    <span className="text-5xl font-display italic text-white/10">
                      {tour.name[0]}
                    </span>
                  </div>

                  {/* 360 badge */}
                  <div className="absolute top-3 right-3 bg-white/10 rounded-full px-3 py-1 border border-white/10">
                    <span className="text-[10px] text-white/60 font-medium tracking-wider">
                      360°
                    </span>
                  </div>

                  {/* Play */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    </div>
                  </div>

                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white/80 text-sm font-medium m-0 text-left">
                      {tour.name}
                    </p>
                    <p className="text-white/40 text-xs m-0 text-left">
                      {tour.location}
                    </p>
                  </div>
                </button>
              </ScrollReveal>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-20">
            <h3 className="text-xl font-display italic mb-4">
              Interested in Our Properties?
            </h3>
            <p className="text-muted text-sm mb-6">
              Panglao Prime Villas: PHP 395,000/month verified income. Only 2 remaining.
            </p>
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

      {/* Tour Modal */}
      <AnimatePresence>
        {activeTour && (
          <TourModal tour={activeTour} onClose={() => setActiveTour(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
