"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SITE_CONFIG } from "@/lib/config";
import {
  BedDouble,
  Ruler,
  Waves,
  TrendingUp,
  MapPin,
  Phone,
  MessageCircle,
  Shield,
  Building2,
  ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Portal-source-specific landing page for property lead capture     */
/* ------------------------------------------------------------------ */

const VILLA_DATA = [
  {
    name: "Villa C",
    pricePHP: "PHP 35,000,000",
    priceUSD: "~USD 600,000",
    status: "For Sale",
    bedrooms: 4,
    bathrooms: 4,
    floorArea: "263.78 sqm",
    stories: 3,
    image: "/images/exterior/hero-aerial.webp",
  },
  {
    name: "Villa D",
    pricePHP: "PHP 32,500,000",
    priceUSD: "~USD 560,000",
    status: "For Sale",
    bedrooms: 4,
    bathrooms: 4,
    floorArea: "263.78 sqm",
    stories: 3,
    image: "/images/exterior/panglao-rear.webp",
  },
];

const FEATURES = [
  { icon: BedDouble, label: "4 Bedrooms", desc: "Spacious master + 3 guest rooms" },
  { icon: Waves, label: "Private Pool", desc: "Plus rooftop jacuzzi" },
  { icon: Ruler, label: "263.78 sqm", desc: "3-story premium layout" },
  { icon: MapPin, label: "60 Seconds", desc: "Walk to Panglao Beach" },
  { icon: TrendingUp, label: "17-25% ROI", desc: "Verified Airbnb income" },
  { icon: Building2, label: "PHP 395,000/mo", desc: "Verified monthly rental" },
];

export default function PortalLandingPage() {
  const params = useParams();
  const source = params.source as string;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px]">
        <Image
          src="/images/exterior/hero-aerial.webp"
          alt="Panglao Prime Villas - Aerial View"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="text-amber-400 tracking-widest uppercase text-sm mb-2">
            Blue Everest Asset Group
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Panglao Prime Villas
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl">
            Luxury Investment Villas in Bohol, Philippines
          </p>
          <p className="text-amber-400 mt-4 text-lg font-semibold">
            Only 2 Villas Remaining - 4 New Villas Coming Soon
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.label} className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <f.icon className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <p className="font-semibold text-lg">{f.label}</p>
              <p className="text-white/60 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Villas */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Available Villas</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {VILLA_DATA.map((villa) => (
            <div key={villa.name} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="relative h-64">
                <Image src={villa.image} alt={villa.name} fill className="object-cover" />
                <div className="absolute top-4 right-4 bg-amber-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
                  {villa.status}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{villa.name}</h3>
                <p className="text-3xl font-bold text-amber-400 mb-1">{villa.pricePHP}</p>
                <p className="text-white/60 mb-4">{villa.priceUSD}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-amber-400" />
                    <span>{villa.bedrooms} Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-amber-400" />
                    <span>{villa.floorArea}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>{villa.stories} Stories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Waves className="w-4 h-4 text-amber-400" />
                    <span>Private Pool</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Investment Highlights */}
      <section className="py-16 px-4 bg-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Investment Highlights</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <p className="text-4xl font-bold text-amber-400 mb-2">PHP 395,000</p>
              <p className="text-white/70">Verified Monthly Airbnb Income</p>
            </div>
            <div className="p-6">
              <p className="text-4xl font-bold text-amber-400 mb-2">17-25%</p>
              <p className="text-white/70">Annual Return on Investment</p>
            </div>
            <div className="p-6">
              <p className="text-4xl font-bold text-amber-400 mb-2">65%</p>
              <p className="text-white/70">Average Annual Occupancy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Prime Location</h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-lg">Bingag, Panglao, Bohol</p>
              <p className="text-white/70">Between JW Marriott and Mithi Resort</p>
            </div>
          </div>
          <ul className="space-y-2 text-white/80 ml-9">
            <li>60 seconds walk to Panglao Beach</li>
            <li>15 minutes to Panglao International Airport</li>
            <li>Near Alona Beach, diving sites, and tourist attractions</li>
            <li>Bohol is a top tourism destination in the Philippines</li>
          </ul>
        </div>
      </section>

      {/* Ownership for Foreign Buyers */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          <Shield className="w-8 h-8 text-amber-400 inline mr-2" />
          Ownership Solutions
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Deed of Assignment", desc: "Full ownership rights through deed transfer" },
            { title: "Leasehold 25+25", desc: "50-year renewable leasehold agreement" },
            { title: "Domestic Corporation", desc: "Own through a Philippine corporation (60/40)" },
          ].map((opt) => (
            <div key={opt.title} className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold text-amber-400 mb-2">{opt.title}</h3>
              <p className="text-white/70 text-sm">{opt.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-white/50 text-sm mt-6">
          BDO Bank financing available for qualified Filipino buyers
        </p>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-16 px-4 bg-gradient-to-b from-amber-500/10 to-transparent">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Schedule a Private Villa Viewing</h2>
          <p className="text-white/70 mb-8">
            Contact us directly via WhatsApp for immediate response
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href={`https://wa.me/639542555553?text=Hi%2C%20I%27m%20interested%20in%20Panglao%20Prime%20Villas%20(from%20${source})`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors no-underline"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp (Marketing)
            </a>
            <a
              href={`https://wa.me/639958565865?text=Hi%2C%20I%27m%20interested%20in%20Panglao%20Prime%20Villas%20(from%20${source})`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors border border-white/20 no-underline"
            >
              <Phone className="w-5 h-5" />
              WhatsApp (Office)
            </a>
          </div>

          <div className="text-white/50 text-sm space-y-1">
            <p>WhatsApp (Marketing): {SITE_CONFIG.whatsapp.marketing}</p>
            <p>WhatsApp (Office): {SITE_CONFIG.whatsapp.office}</p>
          </div>
        </div>
      </section>

      {/* Broker Registration */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-3">Are You a Broker or Agent?</h3>
          <p className="text-white/70 mb-6">
            Register as a referral partner and earn commissions on successful sales.
          </p>
          <a
            href={`https://wa.me/639542555553?text=Hi%2C%20I%27m%20a%20broker%20interested%20in%20the%20referral%20program%20(from%20${source})`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-6 py-3 rounded-xl font-semibold transition-colors no-underline"
          >
            Register as Partner
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10 text-center text-white/40 text-sm">
        <p>Blue Everest Asset Group Holding Inc. - Philippine Company</p>
        <p className="mt-1">
          <Link href={SITE_CONFIG.facebook} target="_blank" rel="noopener noreferrer" className="text-amber-400/60 hover:text-amber-400 no-underline">
            Facebook
          </Link>
          {" - "}
          <Link href="/" className="text-amber-400/60 hover:text-amber-400 no-underline">
            blue-everest.com
          </Link>
        </p>
        {source && (
          <p className="mt-2 text-white/20 text-xs">Source: {source}</p>
        )}
      </footer>
    </div>
  );
}
