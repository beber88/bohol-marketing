// src/lib/marketing-utils/fx-rates.ts
// FX rate utility for Panglao Prime Villas pricing

import { promises as fs } from 'fs';
import path from 'path';

/** Hardcoded fallback rates if the config file is unavailable */
const FALLBACK_RATES = {
  date: '2026-05-22',
  phpToIls: 0.047202,
  phpToUsd: 0.016234,
} as const;

/** Villa prices in PHP (source of truth) */
const VILLA_PRICES_PHP = {
  villaC: 35_000_000,
  villaD: 32_500_000,
} as const;

interface FxConfigFile {
  date: string;
  php_to_ils: number;
  php_to_usd: number;
  [key: string]: unknown;
}

interface FxRates {
  date: string;
  phpToIls: number;
  phpToUsd: number;
}

interface VillaPricing {
  villaC: { php: number; ils: number; usd: number };
  villaD: { php: number; ils: number; usd: number };
}

let cachedRates: FxRates | null = null;

/**
 * Load FX rates from the config file at the Bohol Marketing project root.
 * Falls back to hardcoded rates if the file is missing or malformed.
 */
async function loadRatesFromFile(): Promise<FxRates> {
  // The config file lives at the Bohol Marketing root, one level above blue-everest
  const configPaths = [
    path.resolve(process.cwd(), '..', 'config', 'fx_today.json'),
    path.resolve(process.cwd(), 'config', 'fx_today.json'),
  ];

  for (const configPath of configPaths) {
    try {
      const raw = await fs.readFile(configPath, 'utf-8');
      const data: FxConfigFile = JSON.parse(raw);

      if (
        typeof data.php_to_ils === 'number' &&
        typeof data.php_to_usd === 'number'
      ) {
        return {
          date: data.date ?? FALLBACK_RATES.date,
          phpToIls: data.php_to_ils,
          phpToUsd: data.php_to_usd,
        };
      }
    } catch {
      // Try next path
    }
  }

  console.warn(
    '[fx-rates] Could not load config/fx_today.json. Using fallback rates.'
  );
  return { ...FALLBACK_RATES };
}

/**
 * Get the current FX rates. Caches after first load.
 */
export async function getFxRates(): Promise<FxRates> {
  if (!cachedRates) {
    cachedRates = await loadRatesFromFile();
  }
  return cachedRates;
}

/**
 * Convert PHP amount to ILS using current rates.
 */
export async function convertPhpToIls(php: number): Promise<number> {
  const rates = await getFxRates();
  return Math.round(php * rates.phpToIls);
}

/**
 * Convert PHP amount to USD using current rates.
 */
export async function convertPhpToUsd(php: number): Promise<number> {
  const rates = await getFxRates();
  return Math.round(php * rates.phpToUsd);
}

/**
 * Get full villa pricing in all three currencies.
 */
export async function getVillaPricing(): Promise<VillaPricing> {
  const rates = await getFxRates();

  return {
    villaC: {
      php: VILLA_PRICES_PHP.villaC,
      ils: Math.round(VILLA_PRICES_PHP.villaC * rates.phpToIls),
      usd: Math.round(VILLA_PRICES_PHP.villaC * rates.phpToUsd),
    },
    villaD: {
      php: VILLA_PRICES_PHP.villaD,
      ils: Math.round(VILLA_PRICES_PHP.villaD * rates.phpToIls),
      usd: Math.round(VILLA_PRICES_PHP.villaD * rates.phpToUsd),
    },
  };
}

/**
 * Force reload rates from file (e.g., after daily FX update).
 */
export function invalidateCache(): void {
  cachedRates = null;
}
