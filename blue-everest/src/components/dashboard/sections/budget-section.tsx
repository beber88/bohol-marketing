"use client";

import { useTranslation } from "@/lib/i18n";
import { BUDGET, FX_RATES, PAYMENT_STRUCTURE, OWNERSHIP_OPTIONS } from "@/lib/data/dashboard-data";
import { VILLA_DATA, INVESTMENT_DATA } from "@/lib/config";

export function BudgetSection() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Phase 1 + Phase 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-stroke bg-surface p-6">
          <h3 className="font-display text-base font-semibold mb-4">{t.dashboard.budget.phase1}</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-stroke">
              <th className="py-2 text-left text-xs text-muted">Campaign</th>
              <th className="py-2 text-left text-xs text-muted">Daily</th>
              <th className="py-2 text-left text-xs text-muted">7-Day</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-stroke/50"><td className="py-2.5">IL-1 Awareness</td><td>$20</td><td>$140</td></tr>
              <tr className="border-b border-stroke/50"><td className="py-2.5">PH-1 Awareness</td><td>$15</td><td>$105</td></tr>
              <tr className="font-semibold"><td className="py-2.5">Total Phase 1</td><td>$35/day</td><td>${BUDGET.phase1.totalUsd}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="rounded-2xl border border-stroke bg-surface p-6">
          <h3 className="font-display text-base font-semibold mb-4">{t.dashboard.budget.phase2}</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-stroke">
              <th className="py-2 text-left text-xs text-muted">Campaign</th>
              <th className="py-2 text-left text-xs text-muted">Daily</th>
              <th className="py-2 text-left text-xs text-muted">8-Day</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-stroke/50"><td className="py-2.5">IL-1 + IL-2 + IL-3</td><td>$45</td><td>$360</td></tr>
              <tr className="border-b border-stroke/50"><td className="py-2.5">PH-1 + PH-2 + PH-3</td><td>$33</td><td>$264</td></tr>
              <tr className="font-semibold"><td className="py-2.5">Total Phase 2</td><td>$78/day</td><td>${BUDGET.phase2.totalUsd}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="rounded-2xl border border-stroke bg-surface p-6">
        <h3 className="font-display text-base font-semibold mb-5">{t.dashboard.budget.summary}</h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="font-display text-3xl font-bold">${BUDGET.estimatedTotalUsd}</div>
            <div className="text-xs text-muted mt-1">Estimated 15-Day Spend</div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold">${BUDGET.totalUsd}</div>
            <div className="text-xs text-muted mt-1">Total Budget</div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-emerald-400">${BUDGET.bufferUsd}</div>
            <div className="text-xs text-muted mt-1">Buffer for Scaling</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-3 rounded-full bg-bg overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#89AACC] to-[#4E85BF]"
              style={{ width: `${(BUDGET.estimatedTotalUsd / BUDGET.totalUsd) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>$0</span>
            <span>${BUDGET.totalUsd}</span>
          </div>
        </div>
      </div>

      {/* Villa Specifications */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-4">{t.dashboard.budget.villaSpecs}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[VILLA_DATA.villaC, VILLA_DATA.villaD].map(villa => (
            <div key={villa.id} className="rounded-2xl border border-stroke bg-surface p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-display text-xl font-semibold">{villa.name}</h4>
                <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  PRE-SALE
                </span>
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between"><span className="text-muted">Current Price (PHP)</span><span className="font-bold text-lg">{villa.price.phpFormatted}</span></div>
                <div className="flex justify-between"><span className="text-muted">Lot Size</span><span>{villa.name === "Villa C" ? "192.85 sqm" : "182.03 sqm"}</span></div>
                <div className="flex justify-between"><span className="text-muted">Monthly Income</span><span className="font-semibold text-emerald-400">{INVESTMENT_DATA.monthlyIncomeFormatted}</span></div>
                <div className="flex justify-between"><span className="text-muted">Annual ROI</span><span className="font-semibold text-emerald-400">{INVESTMENT_DATA.annualRoi}</span></div>
                <div className="flex justify-between"><span className="text-muted">GFA</span><span>263.78 sqm</span></div>
                <div className="flex justify-between"><span className="text-muted">Bedrooms</span><span>4</span></div>
                <div className="flex justify-between"><span className="text-muted">Stories</span><span>3 + Roof Deck</span></div>
                <div className="flex justify-between"><span className="text-muted">Pool</span><span>Private</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Structure */}
      <div className="rounded-2xl border border-stroke bg-surface p-6">
        <h3 className="font-display text-base font-semibold mb-5">{t.dashboard.budget.paymentStructure}</h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          {PAYMENT_STRUCTURE.map(ps => (
            <div key={ps.label}>
              <div className="font-display text-3xl font-bold bg-gradient-to-r from-[#89AACC] to-[#4E85BF] bg-clip-text text-transparent">
                {ps.pct}%
              </div>
              <div className="text-xs text-muted mt-1">{ps.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-xs text-muted">
          BDO Bank financing available for Filipino buyers (subject to qualification)
        </div>
      </div>

      {/* PHP Reference Values */}
      <div className="rounded-2xl border border-stroke bg-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-stroke">
          <h3 className="font-display text-base font-semibold">{t.dashboard.budget.fxRates} ({FX_RATES.date})</h3>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-bg">
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-muted">Item</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-muted">PHP</th>
          </tr></thead>
          <tbody>
            {FX_RATES.items.map(row => (
              <tr key={row.item} className="border-b border-stroke/50">
                <td className="px-6 py-3 font-medium">{row.item}</td>
                <td className="px-6 py-3">{row.php}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ownership Options */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-4">{t.dashboard.budget.ownershipOptions}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {OWNERSHIP_OPTIONS.map((opt, i) => (
            <div key={opt.name} className="rounded-2xl border border-stroke bg-surface p-6 text-center">
              <div className="mb-3 mx-auto h-10 w-10 rounded-full bg-gradient-to-br from-[#89AACC] to-[#4E85BF] flex items-center justify-center text-white font-bold text-sm">
                {i + 1}
              </div>
              <h4 className="font-semibold mb-1">{opt.name}</h4>
              <p className="text-sm text-muted">{opt.description}</p>
              <p className="text-xs text-muted mt-2">{opt.bestFor}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
