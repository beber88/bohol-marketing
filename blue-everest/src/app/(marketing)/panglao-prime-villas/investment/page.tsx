"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { SITE_CONFIG, INVESTMENT_DATA } from "@/lib/config";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import {
  ChevronLeft,
  Globe,
  MessageCircle,
  Phone,
  TrendingUp,
  Calculator,
  BarChart3,
  DollarSign,
} from "lucide-react";

function ROICalculator() {
  const [villa, setVilla] = useState<"c" | "d">("d");
  const [financing, setFinancing] = useState(false);

  const prices = { c: 35_000_000, d: 32_500_000 };
  const price = prices[villa];
  const monthlyIncome = 395_000;
  const annualIncome = monthlyIncome * 12;

  // Cash purchase
  const cashROI = ((annualIncome / price) * 100).toFixed(1);

  // With financing (BDO: 70% LTV, 6% interest, 15 years)
  const loanAmount = price * 0.7;
  const downPayment = price * 0.3;
  const monthlyRate = 0.06 / 12;
  const totalPayments = 15 * 12;
  const monthlyMortgage =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1);
  const netMonthlyCashflow = monthlyIncome - monthlyMortgage;
  const leveragedROI = (((netMonthlyCashflow * 12) / downPayment) * 100).toFixed(1);

  return (
    <div className="rounded-2xl border border-stroke bg-surface p-6 sm:p-8">
      <h3 className="text-xl font-display italic mb-6 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-[#89AACC]" />
        ROI Calculator
      </h3>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setVilla("d")}
          className={`flex-1 py-2.5 rounded-xl text-sm border-0 cursor-pointer transition-colors ${
            villa === "d" ? "accent-gradient text-white" : "bg-bg border border-stroke text-muted"
          }`}
        >
          Villa D (PHP 32.5M)
        </button>
        <button
          onClick={() => setVilla("c")}
          className={`flex-1 py-2.5 rounded-xl text-sm border-0 cursor-pointer transition-colors ${
            villa === "c" ? "accent-gradient text-white" : "bg-bg border border-stroke text-muted"
          }`}
        >
          Villa C (PHP 35M)
        </button>
      </div>

      <label className="flex items-center gap-3 mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={financing}
          onChange={(e) => setFinancing(e.target.checked)}
          className="w-5 h-5 rounded accent-[#89AACC]"
        />
        <span className="text-sm text-text-primary">
          BDO Bank Financing (70% LTV, 6%, 15 years)
        </span>
      </label>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-bg border border-stroke">
            <p className="text-xs text-muted m-0 mb-1">Purchase Price</p>
            <p className="text-lg font-display italic text-text-primary m-0">
              PHP {price.toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-bg border border-stroke">
            <p className="text-xs text-muted m-0 mb-1">Monthly Income</p>
            <p className="text-lg font-display italic text-[#89AACC] m-0">
              PHP {monthlyIncome.toLocaleString()}
            </p>
          </div>
        </div>

        {financing ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-bg border border-stroke">
                <p className="text-xs text-muted m-0 mb-1">Down Payment (30%)</p>
                <p className="text-lg font-display italic text-text-primary m-0">
                  PHP {downPayment.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-bg border border-stroke">
                <p className="text-xs text-muted m-0 mb-1">Monthly Mortgage</p>
                <p className="text-lg font-display italic text-text-primary m-0">
                  PHP {Math.round(monthlyMortgage).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl accent-gradient/10 border border-[#89AACC]/20">
                <p className="text-xs text-muted m-0 mb-1">Net Monthly Cashflow</p>
                <p className="text-xl font-display italic text-[#89AACC] m-0">
                  PHP {Math.round(netMonthlyCashflow).toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-xl accent-gradient/10 border border-[#89AACC]/20">
                <p className="text-xs text-muted m-0 mb-1">Cash-on-Cash ROI</p>
                <p className="text-xl font-display italic text-[#89AACC] m-0">
                  {leveragedROI}%
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-bg border border-[#89AACC]/20">
              <p className="text-xs text-muted m-0 mb-1">Annual Income</p>
              <p className="text-xl font-display italic text-[#89AACC] m-0">
                PHP {annualIncome.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-bg border border-[#89AACC]/20">
              <p className="text-xs text-muted m-0 mb-1">Annual ROI</p>
              <p className="text-xl font-display italic text-[#89AACC] m-0">
                {cashROI}%
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ComparisonTable() {
  const comparisons = [
    { asset: "Panglao Prime Villa", annualReturn: "17-25%", monthlyIncome: "PHP 395K", risk: "Medium", liquidity: "Medium", effort: "Zero (managed)" },
    { asset: "PH Stock Market (PSEi)", annualReturn: "6-10%", monthlyIncome: "Dividends only", risk: "High", liquidity: "High", effort: "Active" },
    { asset: "PH Government Bonds", annualReturn: "5-7%", monthlyIncome: "Semi-annual", risk: "Low", liquidity: "Low", effort: "None" },
    { asset: "Manila Condo Rental", annualReturn: "3-5%", monthlyIncome: "PHP 20-50K", risk: "Medium", liquidity: "Low", effort: "Self-managed" },
    { asset: "Time Deposit (BDO)", annualReturn: "2-4%", monthlyIncome: "At maturity", risk: "Very Low", liquidity: "Low", effort: "None" },
  ];

  return (
    <div className="rounded-2xl border border-stroke bg-surface overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-stroke">
        <h3 className="text-xl font-display italic flex items-center gap-2 m-0">
          <BarChart3 className="w-5 h-5 text-[#89AACC]" />
          Investment Comparison
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stroke">
              <th className="text-left p-4 text-muted text-xs uppercase tracking-wider font-medium">Asset</th>
              <th className="text-left p-4 text-muted text-xs uppercase tracking-wider font-medium">Annual Return</th>
              <th className="text-left p-4 text-muted text-xs uppercase tracking-wider font-medium">Monthly Income</th>
              <th className="text-left p-4 text-muted text-xs uppercase tracking-wider font-medium">Risk</th>
              <th className="text-left p-4 text-muted text-xs uppercase tracking-wider font-medium">Effort</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((row, i) => (
              <tr key={row.asset} className={`border-b border-stroke ${i === 0 ? "bg-[#89AACC]/5" : ""}`}>
                <td className={`p-4 ${i === 0 ? "text-[#89AACC] font-medium" : "text-text-primary"}`}>
                  {row.asset}
                </td>
                <td className={`p-4 ${i === 0 ? "text-[#89AACC] font-medium" : "text-text-primary"}`}>
                  {row.annualReturn}
                </td>
                <td className="p-4 text-text-primary">{row.monthlyIncome}</td>
                <td className="p-4 text-muted">{row.risk}</td>
                <td className="p-4 text-muted">{row.effort}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MarketData() {
  const data = [
    { label: "Bohol Tourists (2025)", value: "1,427,362", change: "+166% vs 2022" },
    { label: "Airport Passengers", value: "2.22M", change: "Over 2M design capacity" },
    { label: "Skyscanner Ranking", value: "#8", change: "Global trending 2025" },
    { label: "Flight Search Growth", value: "+77%", change: "Year-over-year" },
    { label: "Luxury ADR (Airbnb)", value: "PHP 6,000-8,400+", change: "Per night" },
    { label: "Bohol Tourism GDP Share", value: "70-74%", change: "Of provincial GDP" },
  ];

  return (
    <div className="rounded-2xl border border-stroke bg-surface p-6 sm:p-8">
      <h3 className="text-xl font-display italic mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-[#89AACC]" />
        Panglao Market Data
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <div key={item.label} className="p-4 rounded-xl bg-bg border border-stroke">
            <p className="text-xs text-muted m-0 mb-1">{item.label}</p>
            <p className="text-xl font-display italic text-text-primary m-0 mb-1">
              {item.value}
            </p>
            <p className="text-xs text-[#89AACC] m-0">{item.change}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InvestmentPage() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <>
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
          <ScrollReveal>
            <div className="text-center mb-16">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display italic mb-4">
                {t.investmentPage.title}
              </h1>
              <p className="text-muted text-lg max-w-2xl mx-auto">
                {t.investmentPage.subtitle}
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-8">
            <ScrollReveal>
              <ROICalculator />
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <ComparisonTable />
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <MarketData />
            </ScrollReveal>

            {/* Financing section */}
            <ScrollReveal delay={0.3}>
              <div className="rounded-2xl border border-stroke bg-surface p-6 sm:p-8">
                <h3 className="text-xl font-display italic mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#89AACC]" />
                  {t.investmentPage.financing}
                </h3>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  {t.investmentPage.financingDescription}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-bg border border-stroke text-center">
                    <p className="text-2xl font-display italic text-[#89AACC] m-0">70%</p>
                    <p className="text-xs text-muted m-0 mt-1">Loan-to-Value</p>
                  </div>
                  <div className="p-4 rounded-xl bg-bg border border-stroke text-center">
                    <p className="text-2xl font-display italic text-[#89AACC] m-0">6%</p>
                    <p className="text-xs text-muted m-0 mt-1">Annual Interest</p>
                  </div>
                  <div className="p-4 rounded-xl bg-bg border border-stroke text-center">
                    <p className="text-2xl font-display italic text-[#89AACC] m-0">15 yrs</p>
                    <p className="text-xs text-muted m-0 mt-1">Loan Term</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Bottom CTA */}
          <div id="contact" className="text-center mt-16">
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
