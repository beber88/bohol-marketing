#!/usr/bin/env npx tsx
/**
 * Updates ALL posts in posts-data.ts with complete distribution lists.
 * Every post gets EVERY relevant placement with exact URLs.
 * Groups we haven't joined get type: "share" (share from page to group).
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const PAGE_URL = "https://www.facebook.com/BlueEverestGroup";
const PAGE_ID = "1091251924067685";

// ── All groups by segment ─────────────────────────────────

const IL_GROUPS = [
  { target: "נדלן והשקעות בפיליפינים", url: "https://www.facebook.com/groups/investment.ph.il/", joined: true },
  { target: "ישראלים בפיליפינים", url: "https://www.facebook.com/groups/822687757789549/", joined: false },
  { target: "Israel Philippines Community", url: "https://www.facebook.com/groups/israel.philippines/", joined: false },
  { target: "עסקים בפיליפינים, יזמים ישראלים", url: "https://www.facebook.com/groups/1703314606626241/", joined: false },
  { target: "Jewish & Israeli RE Investors", url: "https://www.facebook.com/groups/426821971015316/", joined: false },
];

const PH_GROUPS = [
  { target: "PANGLAO BOHOL PROPERTIES FOR SALE", url: "https://www.facebook.com/groups/143654442368930/", joined: false },
  { target: "Bohol Properties For Sale", url: "https://www.facebook.com/groups/boholpropertiesforsale/", joined: false },
  { target: "BOHOL Real Estate for Sale or Rent", url: "https://www.facebook.com/groups/175361136564347/", joined: false },
  { target: "OFW Property Investment PH", url: "https://www.facebook.com/groups/ofwpropertyinvestment/", joined: false },
  { target: "OFW Real Estate Properties Investment PH", url: "https://www.facebook.com/groups/848276462199962/", joined: false },
  { target: "OFW Global", url: "https://www.facebook.com/groups/ofwinvestment/", joined: false },
  { target: "Buy, Sell, Rent & Invest - RE Philippines", url: "https://www.facebook.com/groups/2669597893303292/", joined: false },
  { target: "Real Estate Philippines Buy, Sell & Rent", url: "https://www.facebook.com/groups/philippinerealestatecommunity/", joined: false },
  { target: "REAL ESTATE PHILIPPINES", url: "https://www.facebook.com/groups/realestatepho/", joined: false },
  { target: "PHILIPPINE RE - FOR SALE BY OWNER", url: "https://www.facebook.com/groups/2074935019317208/", joined: false },
  { target: "PROPERTY FOR SALE IN THE PHILIPPINES", url: "https://www.facebook.com/groups/1473743926177925/", joined: false },
  { target: "Philippine RE Buyers and Renters", url: "https://www.facebook.com/groups/103556767959/", joined: false },
  { target: "Philippines RE (Condo, Lots, House & Lot)", url: "https://www.facebook.com/groups/421416569208434/", joined: false },
  { target: "The Real Estate Group Philippines", url: "https://www.facebook.com/groups/therealestategroupphilippines/", joined: false },
  { target: "Real Estate Investors Philippines", url: "https://www.facebook.com/groups/141622635854137/", joined: false },
  { target: "Beachfront & Luxury RE Philippines", url: "https://www.facebook.com/groups/1439777089708009/", joined: false },
];

const BOHOL_GROUPS = [
  { target: "PANGLAO BOHOL PROPERTIES FOR SALE", url: "https://www.facebook.com/groups/143654442368930/", joined: false },
  { target: "Bohol Properties For Sale", url: "https://www.facebook.com/groups/boholpropertiesforsale/", joined: false },
  { target: "BOHOL Real Estate for Sale or Rent", url: "https://www.facebook.com/groups/175361136564347/", joined: false },
  { target: "Panglao, Bohol - Residents & Friends", url: "https://www.facebook.com/groups/panglaoandboholresidentsandfriends/", joined: false },
  { target: "Bohol Islander Group", url: "https://www.facebook.com/groups/521599198683159/", joined: false },
];

const EXPAT_GROUPS = [
  { target: "Panglao, Bohol - Expats & Locals", url: "https://www.facebook.com/groups/989842814391169/", joined: false },
  { target: "Bohol Friends & Expats", url: "https://www.facebook.com/groups/1516890185239016/", joined: false },
  { target: "Philippines Expats", url: "https://www.facebook.com/groups/philippineexpats/", joined: false },
  { target: "Expats in the Philippines", url: "https://www.facebook.com/groups/expatsinthephilippines/", joined: false },
  { target: "Expats living in the Philippines", url: "https://www.facebook.com/groups/1554771104828714/", joined: false },
  { target: "Positive Minded Expats PH", url: "https://www.facebook.com/groups/1086657165988662/", joined: false },
  { target: "Expats & Filipinos in PH", url: "https://www.facebook.com/groups/4178638039123645/", joined: false },
];

const GLOBAL_GROUPS = [
  { target: "Airbnb Investing", url: "https://www.facebook.com/groups/airbnbinvesting/", joined: false },
  { target: "Short Term Rental Property Investors", url: "https://www.facebook.com/groups/rentalpropertyinvestors/", joined: false },
  { target: "Short & Mid Term Rental Investors", url: "https://www.facebook.com/groups/Vrolio/", joined: false },
  { target: "CHINESE PROPERTY INVESTORS", url: "https://www.facebook.com/groups/chinesepropertyinternationalinvestors/", joined: false },
  { target: "International Citizens / Expats", url: "https://www.facebook.com/groups/internationalcitizens/", joined: false },
];

function makeGroupDist(g: { target: string; url: string; joined: boolean }) {
  return {
    platform: "Facebook Group",
    target: g.target,
    url: g.url,
    type: g.joined ? "free" as const : "organic" as const,
    status: g.joined ? "scheduled" as const : "pending_join" as const,
    method: g.joined ? "post_directly" : "share_from_page",
  };
}

function buildDistribution(market: string, hasAds: boolean, budget: string | undefined, isVideo: boolean, platform: string) {
  const dist: any[] = [];

  // 1. Always: Blue Everest Page
  dist.push({ platform: "Facebook Page", target: "Blue Everest Asset Group", url: PAGE_URL, type: "free", status: "scheduled", method: "post_as_page" });

  // 2. Market-specific groups
  if (market === "IL") {
    IL_GROUPS.forEach(g => dist.push(makeGroupDist(g)));
    dist.push({ platform: "Facebook Marketplace", target: "Israel Marketplace", url: "https://www.facebook.com/marketplace/", type: "free", status: "scheduled", country: "IL" });
  }

  if (market === "PH") {
    PH_GROUPS.forEach(g => dist.push(makeGroupDist(g)));
    BOHOL_GROUPS.forEach(g => {
      if (!dist.find((d: any) => d.url === g.url)) dist.push(makeGroupDist(g));
    });
    dist.push({ platform: "Facebook Marketplace", target: "Philippines Marketplace", url: "https://www.facebook.com/marketplace/", type: "free", status: "scheduled", country: "PH" });
  }

  if (market === "INTL" || market === "BOTH") {
    BOHOL_GROUPS.forEach(g => dist.push(makeGroupDist(g)));
    EXPAT_GROUPS.forEach(g => dist.push(makeGroupDist(g)));
    GLOBAL_GROUPS.forEach(g => dist.push(makeGroupDist(g)));
    // Also IL and PH groups for global posts
    IL_GROUPS.forEach(g => dist.push(makeGroupDist(g)));
    PH_GROUPS.forEach(g => {
      if (!dist.find((d: any) => d.url === g.url)) dist.push(makeGroupDist(g));
    });
  }

  if (market === "KR") {
    dist.push({ platform: "Facebook Group", target: "Korean Investors PH (pending)", url: "#", type: "organic", status: "pending_join", method: "share_from_page" });
    EXPAT_GROUPS.slice(0, 3).forEach(g => dist.push(makeGroupDist(g)));
  }

  if (market === "CN") {
    dist.push(makeGroupDist(GLOBAL_GROUPS[3])); // Chinese Property Investors
    EXPAT_GROUPS.slice(0, 3).forEach(g => dist.push(makeGroupDist(g)));
  }

  if (["SG", "HK", "US", "EU", "UAE", "AU"].includes(market)) {
    EXPAT_GROUPS.forEach(g => dist.push(makeGroupDist(g)));
    GLOBAL_GROUPS.slice(0, 3).forEach(g => dist.push(makeGroupDist(g)));
    dist.push({ platform: "LinkedIn", target: "Blue Everest LinkedIn", url: "https://linkedin.com", type: "organic", status: "scheduled", method: "post_organic" });
  }

  // 3. Paid ads
  if (hasAds && budget) {
    if (platform.includes("Meta") || platform.includes("FB")) {
      dist.push({ platform: "Meta Ads", target: `${market} Audience`, type: "paid", budget, country: market, status: "scheduled" });
    }
    if (platform.includes("Google")) {
      dist.push({ platform: "Google Ads", target: `${market} Search`, type: "paid", budget, country: market, status: "scheduled" });
    }
  }

  // 4. Video/Reel specific
  if (isVideo) {
    dist.push({ platform: "YouTube", target: "Blue Everest YouTube", url: "https://youtube.com", type: "organic", status: "scheduled", method: "upload" });
    dist.push({ platform: "Instagram Reels", target: "Blue Everest IG", url: "https://instagram.com/blueeverestgroup", type: "free", status: "scheduled", method: "upload_reel" });
    dist.push({ platform: "TikTok", target: "Blue Everest TikTok", url: "https://tiktok.com", type: "free", status: "scheduled", method: "upload" });
  }

  // 5. Instagram for all
  if (!isVideo && (platform.includes("IG") || platform.includes("Instagram"))) {
    dist.push({ platform: "Instagram Feed", target: "Blue Everest IG", url: "https://instagram.com/blueeverestgroup", type: "free", status: "scheduled" });
  }

  return dist;
}

// ── Main: Read posts-data.ts, update distributions ──────────

const filePath = resolve(process.cwd(), "src/lib/data/posts-data.ts");
let content = readFileSync(filePath, "utf-8");

// Parse each post's market, budget, platform, mediaType
const postPattern = /\{\s*id:\s*"([^"]+)"[\s\S]*?market:\s*"([^"]+)"[\s\S]*?platform:\s*"([^"]+)"[\s\S]*?(?:budget:\s*"([^"]*)")?[\s\S]*?(?:mediaType:\s*"([^"]*)")?[\s\S]*?(?:distribution:\s*\[[\s\S]*?\])/g;

let match;
let updates = 0;

// Simpler approach: find each distribution array and replace it
const posts: { id: string; market: string; platform: string; budget?: string; mediaType?: string }[] = [];

// Extract post metadata
const idMatches = [...content.matchAll(/id:\s*"([^"]+)"/g)];
const marketMatches = [...content.matchAll(/market:\s*"([^"]+)"/g)];
const platformMatches = [...content.matchAll(/platform:\s*"([^"]+)"/g)];
const budgetMatches = [...content.matchAll(/budget:\s*"([^"]*)"/g)];

console.log(`Found ${idMatches.length} posts`);

// For each post, rebuild its distribution
for (let i = 0; i < idMatches.length; i++) {
  const id = idMatches[i][1];
  const market = marketMatches[i]?.[1] || "INTL";
  const platform = platformMatches[i]?.[1] || "";

  // Find budget near this post
  const postStart = idMatches[i].index!;
  const nextPostStart = i < idMatches.length - 1 ? idMatches[i + 1].index! : content.length;
  const postBlock = content.slice(postStart, nextPostStart);

  const budgetMatch = postBlock.match(/budget:\s*"([^"]*)"/);
  const budget = budgetMatch?.[1];
  const mediaMatch = postBlock.match(/mediaType:\s*"([^"]*)"/);
  const mediaType = mediaMatch?.[1];
  const hasAds = !!budget && platform.includes("Meta") || platform.includes("Google");
  const isVideo = mediaType === "video" || mediaType === "reel";

  const newDist = buildDistribution(market, hasAds, budget, isVideo, platform);

  // Find and replace the distribution array for this post
  const distStart = postBlock.indexOf("distribution:");
  if (distStart === -1) continue;

  const distBlockStart = postBlock.indexOf("[", distStart);
  let bracketCount = 0;
  let distBlockEnd = distBlockStart;
  for (let j = distBlockStart; j < postBlock.length; j++) {
    if (postBlock[j] === "[") bracketCount++;
    if (postBlock[j] === "]") bracketCount--;
    if (bracketCount === 0) { distBlockEnd = j + 1; break; }
  }

  const oldDist = postBlock.slice(distBlockStart, distBlockEnd);
  const newDistStr = JSON.stringify(newDist, null, 6).replace(/\n/g, "\n    ");

  content = content.replace(oldDist, newDistStr);
  updates++;
  console.log(`  ${id} (${market}): ${newDist.length} placements`);
}

writeFileSync(filePath, content, "utf-8");
console.log(`\nUpdated ${updates} posts`);

// Count total
const totalPlacements = (content.match(/"platform":/g) || []).length;
console.log(`Total placements: ${totalPlacements}`);
