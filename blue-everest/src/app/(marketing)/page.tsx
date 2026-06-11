"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { SITE_CONFIG, COMPANY_INFO } from "@/lib/config";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { Target, Building2, Shield, Briefcase, MapPin, Send } from "lucide-react";

/* ================================================================== */
/*  PROJECT DATA                                                       */
/* ================================================================== */

const PROJECTS = [
  {
    name: "Panglao Prime Villas", location: "Panglao, Bohol", cta: "https://primevilla.ph",
    tour: "https://kuula.co/share/collection/7HMGx?logo=1&info=0&logosize=96&fs=1&vr=0&initload=0&thumbs=1&margin=10",
    scenes: [
      { title: "Aerial View", src: "/images/exterior/hero-aerial.webp", focus: "center 40%" },
      { title: "Front Elevation", src: "/images/exterior/front-1.webp", focus: "center 60%" },
      { title: "Living Room", src: "/images/interior/gf-living-1.webp", focus: "center center" },
      { title: "Kitchen & Dining", src: "/images/interior/gf-kitchen-1.webp", focus: "center center" },
      { title: "Master Suite", src: "/images/interior/3f-masters-1.webp", focus: "center center" },
      { title: "Pool Deck", src: "/images/exterior/pd1.webp", focus: "center 50%" },
      { title: "Rear View", src: "/images/exterior/panglao-rear.webp", focus: "center 60%" },
    ],
  },
  {
    name: "Resort Puerto Galera", location: "Puerto Galera, Mindoro",
    scenes: [
      { title: "Mediterranean Facade", src: "/images/portfolio/puerto-galera-hero.webp", focus: "center 30%" },
      { title: "Exterior Perspective", src: "/images/portfolio/puerto-galera/render-3.webp", focus: "center center" },
      { title: "Outdoor Bath", src: "/images/portfolio/puerto-galera/render-4.webp", focus: "30% center" },
      { title: "Stairs & Kitchen", src: "/images/portfolio/puerto-galera/render-5.webp", focus: "center center" },
    ],
  },
  {
    name: "Villa 22", location: "Clark, Pampanga",
    tour: "https://momento360.com/e/uc/c730b8067f8648708c315b4770332f62?utm_campaign=embed&utm_source=other&size=medium&display-plan=true&upload-key=73dfb649cc344f2fa70ebb108e33e835",
    scenes: [
      { title: "Pool Lounge", src: "/images/portfolio/villa-22-clark.webp", focus: "center center" },
      { title: "360 View 1", src: "/images/portfolio/villa-22-360-view-1.webp", focus: "center center" },
      { title: "360 View 2", src: "/images/portfolio/villa-22-360-view-2.webp", focus: "center center" },
      { title: "360 View 3", src: "/images/portfolio/villa-22-360-view-3.webp", focus: "center center" },
      { title: "Designer Kitchen", src: "/images/portfolio/villa-22/kitchen.webp", focus: "center center" },
      { title: "Wine Cellar", src: "/images/portfolio/villa-22/wine-rack.webp", focus: "center center" },
    ],
  },
  {
    name: "Villa 3", location: "Clark, Pampanga",
    scenes: [
      { title: "Kitchen & Bar", src: "/images/portfolio/villa-3-clark.webp", focus: "center center" },
      { title: "Living Room", src: "/images/portfolio/villa-3-clark-2.webp", focus: "center center" },
      { title: "Pool & Terrace", src: "/images/portfolio/villa-3-clark-4.webp", focus: "center 60%" },
    ],
  },
  {
    name: "Villa 9", location: "Clark, Pampanga",
    tour: "https://editor.rollinom.co.il/360/?id=1632983088",
    scenes: [
      { title: "Front View", src: "/images/portfolio/villa-9-clark.webp", focus: "center 60%" },
      { title: "Master Bath", src: "/images/portfolio/villa-9-clark-2.webp", focus: "center center" },
      { title: "Terrace & Pool", src: "/images/portfolio/villa-9-clark-3.webp", focus: "center center" },
    ],
  },
  {
    name: "Villa Pampanga", location: "Pampanga",
    scenes: [
      { title: "Exterior", src: "/images/portfolio/villa-pampanga.webp", focus: "center center" },
      { title: "Master Bedroom", src: "/images/portfolio/villa-pampanga-2.webp", focus: "center center" },
      { title: "Walk-in Closet", src: "/images/portfolio/villa-pampanga-3.webp", focus: "center center" },
    ],
  },
  {
    name: "Pulu Amsic", location: "Pampanga",
    tour: "https://momento360.com/e/uc/5f929a60261d456a8cd1c89f5976be06?utm_campaign=embed&utm_source=other&size=medium&display-plan=true&upload-key=4a06a0d0565a4d8bb0f676c05c25ae6f",
    scenes: [
      { title: "360 View 1", src: "/images/portfolio/pulu-amsic-360-view-1.webp", focus: "center center" },
      { title: "360 View 2", src: "/images/portfolio/pulu-amsic-360-view-2.webp", focus: "center center" },
      { title: "360 View 3", src: "/images/portfolio/pulu-amsic-360-view-3.webp", focus: "center center" },
      { title: "360 View 4", src: "/images/portfolio/pulu-amsic-360-view-4.webp", focus: "center center" },
      { title: "360 View 5", src: "/images/portfolio/pulu-amsic-360-view-5.webp", focus: "center center" },
    ],
  },
  {
    name: "4 Storey Building", location: "Angeles, Pampanga",
    tour: "https://momento360.com/e/uc/60fadd12e9034476af0ae40c5cebec97?utm_campaign=embed&utm_source=other&size=medium&display-plan=true&upload-key=2c4dd881295e450e843c09b0e26f8509",
    scenes: [
      { title: "Building Exterior", src: "/images/portfolio/4-storey-pampanga-2.webp", focus: "center 40%" },
      { title: "Living Area", src: "/images/portfolio/4-storey-interior-1.webp", focus: "center center" },
      { title: "Kitchen View", src: "/images/portfolio/4-storey-interior-2.webp", focus: "center center" },
      { title: "Dining Space", src: "/images/portfolio/4-storey-interior-3.webp", focus: "center center" },
      { title: "Bedroom", src: "/images/portfolio/4-storey-interior-4.webp", focus: "center center" },
      { title: "Bathroom", src: "/images/portfolio/4-storey-interior-5.webp", focus: "center center" },
      { title: "Unit Interior", src: "/images/portfolio/4-storey-pampanga-3.webp", focus: "center center" },
    ],
  },
];

const SERVICE_ICONS = [Target, Building2, Shield, Briefcase];

/* ================================================================== */
/*  HELPERS                                                            */
/* ================================================================== */

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }} className={className}>{children}</motion.div>
  );
}

/* ================================================================== */
/*  LOADING SCREEN                                                     */
/* ================================================================== */

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [wi, setWi] = useState(0);
  const words = ["Design", "Develop", "Invest", "Build"];
  useEffect(() => {
    const d = 2700; let s: number | null = null; let f: number;
    function step(ts: number) { if (!s) s = ts; const p = Math.min((ts - s) / d, 1); setCount(Math.floor(p * 100)); if (p < 1) f = requestAnimationFrame(step); else setTimeout(onComplete, 400); }
    f = requestAnimationFrame(step); return () => cancelAnimationFrame(f);
  }, [onComplete]);
  useEffect(() => { const iv = setInterval(() => setWi(p => (p + 1) % words.length), 900); return () => clearInterval(iv); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <motion.div className="fixed inset-0 z-[9999] bg-bg" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
      <p className="absolute top-8 left-8 text-xs text-muted uppercase tracking-[0.3em]">Blue Everest</p>
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span key={words[wi]} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}
            className="text-3xl md:text-5xl lg:text-6xl font-display italic text-text-primary/80">{words[wi]}</motion.span>
        </AnimatePresence>
      </div>
      <span className="absolute bottom-12 right-6 text-3xl md:text-6xl lg:text-8xl font-display text-text-primary/30 tabular-nums">{String(count).padStart(3, "0")}</span>
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-stroke/30">
        <div className="h-full accent-gradient origin-left" style={{ transform: `scaleX(${count / 100})` }} />
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  PROJECT TOUR                                                       */
/* ================================================================== */

function ProjectTour({ project, projectIndex }: { project: typeof PROJECTS[number]; projectIndex: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const count = project.scenes.length;
  const [isMobile, setIsMobile] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  useEffect(() => { setIsMobile(window.innerWidth < 768); const fn = () => setIsMobile(window.innerWidth < 768); window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn); }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const unsub = scrollYProgress.on("change", v => { const e = v * (count - 1); setActive(Math.min(Math.floor(e), count - 1)); setProgress(e % 1); });
    return unsub;
  }, [scrollYProgress, count]);

  const h = isMobile ? count * 100 : count * 120;
  const zm = isMobile ? 0.25 : 0.4;

  return (
    <section ref={ref} style={{ height: `${h}vh`, touchAction: "pan-y" }} className="relative">
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-bg">
        {/* Stacked images */}
        {project.scenes.map((scene, i) => {
          let scale = 1, opacity = 0, z = 0;
          if (i === active) { scale = 1 + progress * zm; opacity = 1 - progress * progress; z = 2; }
          else if (i === active + 1) { scale = 0.95 + progress * 0.05; opacity = 0.4 + progress * 0.6; z = 1; }
          else if (i < active) { opacity = 0; z = 3; }
          if (i > active + 1) return null;

          return (
            <div key={i} className="absolute inset-0" style={{ transform: `scale(${scale})`, opacity, zIndex: z }}>
              <Image src={scene.src} alt={scene.title} fill className="object-cover"
                style={{ objectPosition: scene.focus }} sizes="(max-width: 768px) 768px, 100vw"
                priority={projectIndex < 2 && i < 2} loading={projectIndex < 2 ? "eager" : "lazy"} quality={75} />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
            </div>
          );
        })}

        {/* Clean UI - no overlapping */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6 md:p-10">
          {/* Top: project info */}
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.3em]">
              {String(projectIndex + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}
            </p>
            <p className="text-sm md:text-base font-display italic text-white/70 mt-1">{project.name}</p>
            <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mt-1">{project.location}</p>
          </div>

          {/* Bottom: room name + CTA + dots */}
          <div className="flex items-end justify-between">
            <div>
              <AnimatePresence mode="wait">
                <motion.p key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
                  className="text-base md:text-lg text-white/80 font-medium">{project.scenes[active]?.title}</motion.p>
              </AnimatePresence>
              <div className="flex items-center gap-4 mt-3">
                {"cta" in project && project.cta && (
                  <a href={project.cta} className="pointer-events-auto no-underline text-[9px] uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors">
                    Details ↗
                  </a>
                )}
                {"tour" in project && project.tour && (
                  <button onClick={() => setTourOpen(true)}
                    className="pointer-events-auto text-[9px] uppercase tracking-[0.2em] text-[#89AACC] hover:text-white transition-colors">
                    ● 360 Tour
                  </button>
                )}
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5 md:flex-col md:gap-2">
              {project.scenes.map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-400 ${
                  i === active ? "w-5 h-[3px] md:w-[3px] md:h-5 accent-gradient" : "w-1.5 h-[3px] md:w-[3px] md:h-1.5 bg-white/15"
                }`} />
              ))}
            </div>
          </div>
        </div>

        {/* 360 Tour Modal */}
        <AnimatePresence>
          {tourOpen && "tour" in project && project.tour && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
              <button onClick={() => setTourOpen(false)}
                className="absolute top-6 right-6 text-white/60 hover:text-white text-2xl z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                ✕
              </button>
              <div className="w-full h-full max-w-[95vw] max-h-[90vh] rounded-2xl overflow-hidden">
                <iframe src={project.tour} className="w-full h-full border-0" allowFullScreen allow="gyroscope; accelerometer; xr-spatial-tracking" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const onComplete = useCallback(() => setIsLoading(false), []);

  return (
    <>
      <AnimatePresence>{isLoading && <LoadingScreen onComplete={onComplete} />}</AnimatePresence>

      {/* ===== HERO ===== */}
      <section className="relative h-[100dvh] flex items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0" initial={{ scale: 1 }} animate={{ scale: 1.05 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}>
          <Image src="/images/exterior/hero-aerial.webp" alt="Blue Everest" fill priority className="object-cover" sizes="100vw" />
        </motion.div>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-bg" />

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 3.2 }} className="relative z-10 text-center px-6 max-w-2xl">
          <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] mb-6">Blue Everest Asset Group</p>
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-display italic leading-[0.9] text-white mb-5">
            From Vision to Value
          </h1>
          <p className="text-white/50 text-sm leading-relaxed mb-10 max-w-md mx-auto">{COMPANY_INFO.description}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#properties" className="no-underline px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs uppercase tracking-wider hover:bg-white/20 transition-colors border border-white/10">
              Explore Properties
            </a>
            <a href="#contact" className="no-underline px-6 py-3 rounded-full border border-white/10 text-white/60 text-xs uppercase tracking-wider hover:text-white/80 transition-colors">
              Get in Touch
            </a>
          </div>
        </motion.div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[8px] text-white/20 uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-px h-8 bg-white/10 relative overflow-hidden">
            <div className="w-full h-3 accent-gradient animate-scroll-down" />
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="bg-bg py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <p className="text-[10px] text-muted uppercase tracking-[0.4em] mb-5">About</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-2xl md:text-4xl font-display italic leading-[1] text-text-primary mb-6">
              Real estate development<br />& investment company.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-muted text-sm leading-relaxed mb-4">{COMPANY_INFO.description}</p>
            <p className="text-muted/60 text-sm leading-relaxed">{COMPANY_INFO.fullDescription}</p>
          </Reveal>

          <div className="h-px bg-stroke/50 my-14" />

          <Reveal><p className="text-[10px] text-muted uppercase tracking-[0.4em] mb-8">Services</p></Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {COMPANY_INFO.services.map((s, i) => {
              const Icon = SERVICE_ICONS[i];
              return (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="bg-surface rounded-xl border border-stroke p-5 h-full">
                    <Icon className="w-4 h-4 text-[#89AACC] mb-3" />
                    <p className="text-xs font-semibold text-text-primary mb-1.5">{s.name}</p>
                    <p className="text-[11px] text-muted leading-relaxed">{s.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <div className="h-px bg-stroke/50 my-14" />

          <Reveal><p className="text-[10px] text-muted uppercase tracking-[0.4em] mb-6">Markets</p></Reveal>
          <div className="flex flex-wrap gap-2">
            {COMPANY_INFO.markets.map((m, i) => (
              <Reveal key={m} delay={i * 0.04}>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-stroke px-4 py-2 text-xs text-text-primary/70">
                  <MapPin className="w-2.5 h-2.5 text-[#89AACC]" /> {m}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROPERTIES ===== */}
      <section id="properties">
        <div className="bg-bg py-16 px-6 text-center border-t border-stroke/20">
          <Reveal>
            <p className="text-[10px] text-muted uppercase tracking-[0.4em] mb-4">Portfolio</p>
            <h2 className="text-2xl md:text-4xl font-display italic text-text-primary mb-3">Step Inside</h2>
            <p className="text-muted text-xs max-w-sm mx-auto">Scroll through each property to explore its spaces.</p>
          </Reveal>
        </div>
        {PROJECTS.map((p, i) => <ProjectTour key={p.name} project={p} projectIndex={i} />)}
      </section>

      {/* ===== CONTACT ===== */}
      <ContactSection />

      {/* ===== FOOTER ===== */}
      <footer className="bg-bg pt-12 pb-6 overflow-hidden border-t border-stroke/20">
        <div className="mb-10 overflow-hidden">
          <div className="marquee-track">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="text-[50px] md:text-[80px] lg:text-[110px] font-display italic text-stroke-outline text-transparent whitespace-nowrap mx-4">
                BUILDING THE FUTURE • BLUE EVEREST • FROM VISION TO VALUE •{" "}
              </span>
            ))}
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted/40">
          <p>&copy; {new Date().getFullYear()} {SITE_CONFIG.name}</p>
          <div className="flex gap-5">
            <a href="#about" className="no-underline text-muted/40 hover:text-muted transition-colors">About</a>
            <a href="#properties" className="no-underline text-muted/40 hover:text-muted transition-colors">Properties</a>
            <a href="#contact" className="no-underline text-muted/40 hover:text-muted transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ================================================================== */
/*  CONTACT                                                            */
/* ================================================================== */

function ContactSection() {
  const [sent, setSent] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/marketing/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: values.name,
        email: values.email,
        phone: values.phone,
        purpose: values.message,
        source: "blue-everest.com/contact",
        market: "INTL",
      }),
    });

    if (!response.ok) return;
    setSent(true);
    if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
      (window as any).fbq("track", "Lead", { content_name: "Blue Everest Contact Inquiry" });
    }
  };

  return (
    <section id="contact" className="bg-bg py-20 md:py-28 px-6 border-t border-stroke/20">
      <div className="max-w-3xl mx-auto">
        <Reveal><p className="text-[10px] text-muted uppercase tracking-[0.4em] mb-5">Contact</p></Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-2xl md:text-4xl font-display italic leading-[1] text-text-primary mb-4">Get in touch.</h2>
          <p className="text-muted text-sm mb-10 max-w-md">Investment inquiries, development partnerships, or questions about our properties.</p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Reveal>
            {sent ? (
              <div className="bg-surface rounded-xl border border-emerald-500/20 p-8 text-center">
                <p className="text-emerald-400 font-display italic text-xl mb-1">Thank you</p>
                <p className="text-muted text-xs">We&apos;ll respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}
                className="space-y-3">
                <input name="name" required placeholder="Name" className="w-full bg-surface border border-stroke rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-muted/40 focus:outline-none focus:border-[#89AACC]/40" />
                <input name="email" type="email" required placeholder="Email" className="w-full bg-surface border border-stroke rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-muted/40 focus:outline-none focus:border-[#89AACC]/40" />
                <input name="phone" type="tel" placeholder="Phone / WhatsApp" className="w-full bg-surface border border-stroke rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-muted/40 focus:outline-none focus:border-[#89AACC]/40" />
                <textarea name="message" rows={3} placeholder="Message" className="w-full bg-surface border border-stroke rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-muted/40 focus:outline-none focus:border-[#89AACC]/40 resize-none" />
                <button type="submit" className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg accent-gradient text-white text-sm font-medium">
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </form>
            )}
          </Reveal>

          <Reveal delay={0.15}>
            <div className="space-y-3">
              <a href={SITE_CONFIG.whatsappLinks.marketing} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-surface rounded-lg border border-stroke p-4 no-underline hover:border-white/10 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#25D366]"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <div>
                  <p className="text-sm text-text-primary">WhatsApp</p>
                  <p className="text-[11px] text-muted">{SITE_CONFIG.whatsapp.marketing}</p>
                </div>
              </a>
              <a href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-3 bg-surface rounded-lg border border-stroke p-4 no-underline hover:border-white/10 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#89AACC]/10 flex items-center justify-center shrink-0">
                  <Send className="w-3.5 h-3.5 text-[#89AACC]" />
                </div>
                <div>
                  <p className="text-sm text-text-primary">Email</p>
                  <p className="text-[11px] text-muted">{SITE_CONFIG.email}</p>
                </div>
              </a>
              <a href={SITE_CONFIG.facebook} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-surface rounded-lg border border-stroke p-4 no-underline hover:border-white/10 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#1877F2]/10 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#1877F2]"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </div>
                <div>
                  <p className="text-sm text-text-primary">Facebook</p>
                  <p className="text-[11px] text-muted">Blue Everest Asset Group</p>
                </div>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
