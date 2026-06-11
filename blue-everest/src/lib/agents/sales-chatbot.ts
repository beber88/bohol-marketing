// src/lib/agents/sales-chatbot.ts
// RAG-powered sales chatbot for the website chat page

import { BaseAgent } from './base-agent';
import { AGENT_SPECS } from './registry';
import type { AgentInput, AgentOutput } from './types';
import { randomUUID } from 'crypto';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: string;
  metadata?: {
    sources?: string[];
    leadSignals?: string[];
    confidence?: number;
  };
}

export interface ChatResponse {
  message: string;
  language: 'en' | 'he';
  sources: string[];
  leadSignals: string[];
  suggestHandoff: boolean;
  handoffReason?: string;
}

// Hebrew Unicode range
const HEBREW_REGEX = /[\u0590-\u05FF]/;

// Property knowledge base - structured for grounding LLM responses
const PROPERTY_KB = {
  project: {
    name: 'Panglao Prime Villas',
    developer: 'Blue Everest Asset Group Holding Inc.',
    location: 'Bingag, Panglao Island, Bohol, Philippines',
    locationDetail: 'Between JW Marriott (under construction) and Mithi Resort & Spa, 60 seconds walk to Panglao Beach',
    totalUnits: 4,
    sold: ['Villa A', 'Villa B'],
    available: ['Villa C', 'Villa D'],
  },
  villas: {
    villaC: {
      name: 'Villa C',
      lotArea: '192.85 sqm',
      pricePHP: 35_000_000,
      priceFormatted: { php: 'PHP 35,000,000' },
    },
    villaD: {
      name: 'Villa D',
      lotArea: '182.03 sqm',
      pricePHP: 32_500_000,
      priceFormatted: { php: 'PHP 32,500,000' },
    },
    specs: {
      floorArea: '263.78 sqm',
      bedrooms: 4,
      stories: 3,
      features: [
        'Private swimming pool (15.08 sqm) with pool deck',
        'Rooftop jacuzzi (6.37 sqm) with full sea view',
        '4 bedrooms all en-suite with walk-in closets',
        'Japanese spa master bathroom',
        'Floor-to-ceiling glass facades',
        'Natural stone and premium finishes',
        'Outdoor kitchen on roof deck (31.49 sqm open area)',
        'Wood slat detailing throughout',
        'Maid\'s quarter with separate bathroom',
        'Direct pool access from kitchen',
      ],
      floors: {
        ground: 'Living room, dining, kitchen with pool access, maid\'s quarter, powder room',
        second: 'Bedroom 1 (17.3 sqm) with en-suite + walk-in, Guest room (24.77 sqm) with en-suite, private balcony',
        third: 'Master bedroom (25.57 sqm) with master en-suite + walk-in, Bedroom 2 with en-suite, second balcony',
        roofDeck: 'Outdoor lounge, outdoor kitchen, jacuzzi, outdoor dining, 31.49 sqm open area, full sea view',
      },
    },
  },
  income: {
    monthlyAverage: 'PHP 395,000',
    monthlyPeak: 'PHP 400,000-450,000 (Dec-Feb)',
    monthlyRegular: 'PHP 250,000-300,000 (Mar-Nov)',
    annualGross: 'PHP 4,740,000',
    occupancyRate: '65%',
    marketAverageOccupancy: '49%',
    performanceAdvantage: '33% better than market average',
    roiAnnual: '17-25% gross',
    roiNet: '12-18% after management fees',
    roi5Year: '136.9% cumulative',
    appreciation5Year: '+80.9%',
    source: 'Verified from comparable Airbnb properties - Airbtics + AirROI + BSP data 2025',
  },
  payment: {
    schedule: '25/55/20',
    reservation: 'PHP 200,000',
    breakdown: {
      phase1: '25% down payment upon signing',
      phase2: '55% installments over 24 months during construction',
      phase3: '20% upon turnover',
    },
    bdoFinancing: 'BDO Bank financing available - up to 70% LTV, 15-year terms, ~6% interest (Filipino buyers)',
  },
  legal: {
    structures: [
      { name: 'Deed of Assignment', popularity: 'Most popular', desc: 'Full legal title to villa structure. Land stays with developer. Simple, fast, lower transfer costs. Best for: private investors, rental income, flexible exit.' },
      { name: 'Leasehold 25+25', desc: '50 years full control. Live, rent, resell. No corporation needed. Best for: families, long-term residents.' },
      { name: 'Domestic Corporation', desc: '60/40 Filipino-foreign ownership. Can own land. Maximum legal security. Best for: multiple properties, institutional investors.' },
    ],
    doubleTaxTreaty: 'Israel-Philippines double tax treaty exists since 1997',
    remoteProcess: 'Entire process can be completed remotely - digital KYC, no travel required',
    completedFrom: ['Israel', 'UAE', 'USA', 'Singapore', 'Australia'],
  },
  propertyManagement: {
    model: 'Professional Airbnb management company handles everything',
    services: ['Guest communication', 'Cleaning and maintenance', 'Dynamic pricing optimization', 'Reviews management', 'Monthly income reports'],
    fee: '20-25% of gross rental income',
    ownerBenefit: 'Monthly performance report + bank transfer. Block your own dates anytime.',
    fullyPassive: true,
  },
  tourism: {
    arrivals: {
      2019: { total: 1_581_904, note: 'Pre-pandemic peak' },
      2020: { total: 177_341, note: '-88.8% pandemic crash' },
      2022: { total: 535_803, note: '+198% recovery' },
      2023: { total: 1_012_854, foreign: 325_979, domestic: 686_875, note: 'Crossed 1M mark' },
      2024: { total: 1_369_945, foreign: 495_845, domestic: 870_956, note: '+35.2%' },
      2025: { total: 1_427_362, note: 'Record high, +4.18%' },
    },
    cumulativeGrowth: '+166% since 2022',
    peakPeriod: 'Dec 15-28, 2025: 62,240 visitors',
    topMarkets: ['South Korea (42%)', 'China', 'Taiwan', 'USA', 'Germany', 'France'],
    israeliVisitors: '12,742 in 2023, target 35,000/year by 2026',
    revenue: 'PHP 16-17 billion annually',
    perVisitorSpend: 'PHP 75,000 per trip (~4 days)',
    gdpContribution: '70-74% of Bohol provincial GDP',
    recognition: [
      'Skyscanner #8 Top 10 Trending Destinations 2025 (ONLY Philippine destination)',
      '77% surge in flight searches H1 2024',
      'UNESCO Global Geopark - Philippines FIRST and ONLY (2023), 1 of 195 worldwide',
      'Best Tourism Destination Province 2025-2027',
      '#bohol: 1.26 million Instagram posts',
    ],
  },
  infrastructure: {
    airport: {
      name: 'Bohol-Panglao International Airport (TAG)',
      opened: 'November 2018',
      designCapacity: '2 million passengers/year',
      current2025: '2.22 million (exceeding capacity)',
      ranking: 'Top 10 busiest in Philippines',
      flights: '12 daily from Manila (1.25 hrs), direct from Korea (Jin Air, Jeju Air, Air Busan)',
      codeshare: 'Singapore Airlines, All Nippon Airways',
      ecoAirport: 'Philippines first eco-airport (solar, rainwater harvesting)',
      expansion: {
        operator: 'Aboitiz InfraCapital (30-year PPP)',
        nearTerm: '2.5 million passengers',
        target2030: '4 million passengers (DOUBLE current)',
        investment: 'Multi-billion peso modernization through 2027',
      },
    },
    thirdBridge: {
      name: 'Panglao-Tagbilaran City Offshore Bridge Connector',
      type: 'Cable-stayed, 4-lane bridge',
      length: '1.03-2.7 km',
      cost: 'PHP 7.15 billion',
      funding: 'French government formally assured preferential loan (Feb 2026)',
      status: 'Approach roads completed, bidding scheduled',
      impact: 'Historical precedent: new bridges cause 20-40% land appreciation within 5 years',
    },
    panglaoShores: {
      developer: 'Alturas Group',
      size: '50-57.7 hectares',
      investment: 'PHP 25 billion over 10 years',
      components: '6+ hotels, 1,000+ residential units, convention center, beach club, retail mall, night market, medical, school',
      beachfront: '1 km white sand',
      jobs: '8,000-10,000',
      status: 'Phase 1 underway',
      designation: 'TIEZA Flagship Tourism Enterprise Zone',
    },
    jwMarriott: {
      developer: 'AppleOne Group',
      site: '7-hectare oceanfront',
      units: '80 resort rooms + 70 branded residences',
      opening: '2026-2028 phased',
      status: 'Under construction since Dec 2023',
    },
    mgallery: {
      name: 'South Palms MGallery by Accor',
      size: '6.4 hectares, 188 rooms',
      distinction: 'First MGallery resort in Philippines',
    },
    otherDevelopment: {
      smBohol: 'Construction Nov 2025, opening 2028',
      newHotels: '16 projects planned, 4,400+ rooms by 2026',
      construction2024: 'PHP 788M in permits, +53.6% in December',
    },
  },
  realEstateMarket: {
    birZonalValues: {
      coastalWhiteSand: 'PHP 27,500-49,000/sqm',
      coastalResidential: 'PHP 27,500/sqm',
      highway: 'PHP 3,500-4,950/sqm',
      interior: 'PHP 900-1,350/sqm',
    },
    competitors: {
      boracay: { pricePerSqm: 'PHP 55,000-70,000+', tourists: '2.15M', note: 'Saturated, rehabilitation issues' },
      siargao: { pricePerSqm: 'PHP 25,746 median', note: 'Surf-focused, limited airport, seasonal' },
      elNido: { pricePerSqm: 'PHP 12,000-57,200', note: 'Scenic but remote' },
      phuket: { note: '40% higher entry price than Panglao' },
      bali: { note: 'More restrictive foreign ownership, overtourism' },
      manilaCondoBGC: { price: 'PHP 25-35M for 3BR', yield: '3-5%', note: 'Similar price, 4-5x lower return' },
      telAviv: { yield: '2.8-3.1% gross, 1-2% net', note: 'Compare yield, taxes, liquidity, and legal structure' },
    },
    strMarket: {
      totalListings: '934-1,230 active',
      composition: '78% are 1BR/rooms (luxury villas undersupplied)',
      marketOccupancy: '41-52%',
      marketADR: 'PHP 2,481-2,900',
      luxuryVillaOccupancy: '74% (234 nights/year)',
      luxuryVillaADR: 'PHP 8,427/night',
      luxuryVillaAnnual: 'PHP 1.97M+',
    },
    appreciation: '5-8% annually (infrastructure-driven)',
    baliComparison: 'Bali has 16.4M tourists/year with 60,000 hotel rooms. Panglao has 1.4M with rapidly growing rooms. Panglao is approximately 10 years behind Bali on the growth curve - meaning 10 years of appreciation runway ahead.',
    phuketComparison: 'Same tourism trajectory as Phuket 2005, at 40% lower entry price.',
  },
  fiveYearMath: {
    villaD: {
      initialInvestment: 'PHP 32,500,000',
      year1Rental: 'PHP 4,740,000',
      year1PropertyValue: 'PHP 36,595,000 (+12.6%)',
      year1TotalPosition: 'PHP 41,335,000',
      year5CumulativeRental: 'PHP 23,700,000',
      year5PropertyValue: 'PHP 58,825,000 (+81%)',
      year5TotalValue: 'PHP 82,525,000',
      year5TotalGain: 'PHP 50,025,000',
      year5ROI: '153.8%',
    },
    breakEvenYears: '~5.8 years on rental income alone (before appreciation)',
    exitStrategy: 'Recommended 5-7 year hold. Branded management contract increases exit value. Exit buyers: foreign investors, hotel operators, local HNW.',
  },
  israeliContext: {
    israeliCompaniesInPH: ['Amdocs (1,000+ employees)', 'LR Group', 'Maroonz Holdings'],
    israeliVisitorGrowth: '12,742 in 2023 → target 35,000/year by 2026 (3x growth)',
    doubleTaxTreaty: 'Israel-Philippines since 1997 - eliminates double taxation',
    priceComparison: {
      panglaoVilla: 'Villa D: 1,535,000 NIS. Villa C: 1,650,000 NIS.',
    },
    yieldComparison: 'Israel net yield 1-2% vs Panglao 10-15% gross potential = 5-7x better',
    costOfLiving: 'Israel 259% more expensive than Philippines (Livingcost.org). Israeli income buys 3x more in Philippines.',
    historicalConnection: 'Philippines sheltered Jewish refugees in the 1930s - historical bilateral friendship',
  },
  filipinoContext: {
    targetProfile: 'Metro Manila (BGC, Makati, Alabang), Cebu; age 35-58; PHP 500K+/month household; business owners, C-suite, OFW returnees',
    keyMotivation: 'STATUS + PASSIVE INCOME + FAMILY LEGACY + PRIDE',
    mainMessage: 'Stop renting a villa in Bohol for PHP 50,000/night. Own one.',
    bgcComparison: 'BGC 3BR condo: PHP 25-35M, 3-5% yield. Panglao villa: PHP 32.5M, 17-25% yield. Same price, 5x the return.',
    bdoDetails: 'BDO Bank: up to 70% loan-to-value, 15-year terms, approximately 6% interest rate',
    ofwAngle: 'Perfect passive income for OFW families - property managed while you work abroad, monthly bank transfer',
  },
  globalComparisons: {
    pricingRule: 'All monetary amounts are shown only in PHP. Compare markets by yield, taxes, liquidity, and asset features without foreign-currency prices.',
  },
  koreanContext: {
    touristDominance: 'Koreans are 42% of all foreign tourists to Bohol - the LARGEST foreign group',
    directFlights: 'Seoul Incheon: Jin Air, Jeju Air, Air Busan. Busan: 2 airlines. Flight time: ~4 hours',
    investorProfile: 'Korean investors increasingly looking outside Korea due to strict capital controls and high domestic RE prices',
    propertyComparison: 'Panglao Prime Villas are priced at PHP 32,500,000 to PHP 35,000,000. Compare asset features and yield without currency conversion.',
    culturalNote: 'Korean tourists love Bohol for diving, beaches, and lower cost of living. Many return multiple times per year.',
  },
  bdoFinancingDetails: {
    facility: 'PHP 40M construction facility',
    ltv: '40% Loan-to-Value (conservative)',
    gdv: 'PHP 100M Gross Development Value (PHP 25M x 4 villas)',
    constructionCost: 'PHP 10M per villa build cost',
    developerProfit: 'PHP 40.4M (40.4% margin)',
    landPaid: 'PHP 7,026,000 - fully paid, clean title, Lot 8405-G',
    blueprintTrackRecord: '30+ completed projects, PHP 300M+ portfolio, 0 defaults, 100% on-time handover',
    timeline: '24-month construction schedule',
    marketComps: 'Bingag luxury home: PHP 86K/sqm (SOLD), Italian Villa Dauis: PHP 90K/sqm (SOLD). Blue Everest target: PHP 100K/sqm = sweet spot',
    elevation: 'Elevated terrain, zero flood history, protected from coastal surge. 60-100m from beach (second line)',
    rightOfWay: 'Permanent legal access secured and documented',
  },
  driveVideoLinks: {
    video1: { title: 'BLUEEVEREST 1 - Villa Overview', driveId: '1yEuBI36PmRm9uHQXwxR1nLGkEkfCW3RV' },
    video2: { title: 'BLUEEVEREST 2 - Full Tour', driveId: '1JmciI7ev9XVwWCh3CnL0UN2Sbz_Y8bBZ' },
    video3: { title: 'BLUEEVEREST 3 - Location & Beach', driveId: '1c5opYji9O7yuESFhm6jdU9yDUy-zKy9F' },
    video4: { title: 'BLUEEVEREST 4 - Interior Design', driveId: '12B5eik_L9eblyNXoXwDlZFcHOdlQgD4w' },
    video5: { title: 'BLUEEVEREST 5 - Investment Case', driveId: '1HWfj9F0hrNWCmByyMfg3U_qcwqP_6Vmv' },
    video6: { title: 'BLUEEVEREST 6 - Lifestyle', driveId: '1PECl1vpzwCVZdqwHE3MoEUczAxgdAkyU' },
  },
  externalLinks: {
    virtualTour: 'https://kuula.co/share/collection/7HMGx?logo=1&info=0&logosize=96&fs=1&vr=0&initload=0&thumbs=1&margin=10',
    leadFormSheet: 'https://docs.google.com/spreadsheets/d/1oVnbkLNM_DgOAd7EZQVxxaPD0TwNGqqsD7Ezmp0bXSo/edit',
    marketingDeck: 'https://drive.google.com/file/d/1VjkUDB_xDaXJuJepiIqZd_T_r9g7WRwn/view',
    designPlans: 'https://drive.google.com/file/d/1W8izh1PvoQeZ0LJBsdD7ITeB9gzOmaoM/view',
    exteriorPhotos: 'https://drive.google.com/drive/folders/1YLTAXqUsoU0nzyYgtSIWvzoKdD1EaPGi',
    interiorPhotos: 'https://drive.google.com/drive/folders/1FtN_Nhh-OmOhfr1RD6_WH7B3nxalcz-U',
  },
  economy: {
    boholGDP2024: 'PHP 182.4 billion',
    gdpGrowth: '6.6-8.8% (2024)',
    region: 'Central Visayas (Region 7) - fastest-growing region in Philippines (7.3%)',
    nationalRank: '6th fastest-growing economy nationally',
    povertyReduction: '19.1% (2021) to 14.8% (2023) - lowest recorded',
    bankDeposits: 'PHP 68 billion (+10% annual growth)',
    fdiRealEstate2024: 'PHP 17.33 billion (+100% YoY)',
    israelCostComparison: 'Israel is 259% more expensive than Philippines',
  },
  attractions: {
    natural: [
      'Panglao white sand beaches - some of Asia\'s finest',
      'Balicasag Island - world-class diving and snorkeling',
      'Chocolate Hills - unique karst geological formation (1,268 cone-shaped hills)',
      'Danajon Double Barrier Reef - 1 of only 6 in the world',
      'Philippine Tarsier Sanctuary - one of world\'s smallest primates',
      'Loboc River - scenic cultural cruise',
      'Hinagdanan Cave - underground pool',
      'Virgin Island sandbar - pristine sandbar experience',
    ],
    lifestyle: [
      'UNESCO Global Geopark - wellness and eco-tourism destination',
      'World-class diving: 30+ dive sites within 30 minutes',
      'Year-round warm weather (26-32 C)',
      'Growing restaurant and cafe scene',
      'Low cost of living (grocery, dining, transport)',
      'Safe and welcoming community',
      'Growing expat community',
    ],
  },
  objectionHandling: {
    tooExpensive: {
      reframe: 'PHP 32.5M is less than a BGC 3BR condo, but generates PHP 395,000/month. The villa pays for itself.',
      hebrew: 'וילה D במחיר PHP 32,500,000, עם הכנסה חודשית מאומתת של PHP 395,000',
      paymentTerms: '25% down, 55% over 24 months. BDO financing available.',
    },
    tooFar: {
      access: '12 daily flights from Manila (1.25 hours). Direct from Korea. Airport 8-12 min from villa.',
      remote: 'The process is designed for remote review with digital KYC, subject to final legal checks and client documentation.',
      demand: '1.43 million tourists came to Bohol last year. Your guests have no trouble getting here.',
    },
    foreignOwnership: {
      structures: 'Three proven legal structures: Deed of Assignment (most popular), Leasehold 25+25, Domestic Corporation',
      support: 'The process can be prepared remotely with digital KYC, subject to legal review and client documentation.',
      treaty: 'Israel-Philippines double tax treaty since 1997',
    },
    tourismRisk: {
      resilience: 'Bohol survived 88.8% crash in 2020, recovered to record highs by 2025. Growth +166% since 2022.',
      infrastructure: 'PHP 7.15B 3rd bridge + billions in airport expansion. Infrastructure is being built.',
      brands: 'JW Marriott doesn\'t build in uncertain markets. Their 7-hectare resort is under construction now.',
    },
    needToThink: {
      scarcity: 'Villa A and B are already sold. Active conversations on both remaining villas.',
      offer: 'What specific information would help you decide? I can prepare a personalized analysis.',
      hold: 'Reply HOLD and I\'ll note your interest. No obligation.',
    },
    management: {
      model: 'Professional Airbnb management handles everything: guests, cleaning, maintenance, pricing, reviews.',
      passive: 'Monthly report + bank transfer. Block your dates when you want to visit. Fully passive.',
    },
  },
  whatsapp: {
    marketing: '+639542555553',
    office: '+639958565865',
  },
};

// Lead qualification signals
const LEAD_SIGNAL_PATTERNS: Array<{
  signal: string;
  patterns: RegExp[];
  weight: number;
}> = [
  {
    signal: 'budget_mention',
    patterns: [
      /budget/i, /afford/i, /invest.*(?:million|M|php|ils)/i,
      /how much/i, /price/i, /תקציב/i, /כמה עולה/i,
    ],
    weight: 2,
  },
  {
    signal: 'timeline_mention',
    patterns: [
      /when.*(?:ready|available|start|buy)/i, /this year/i,
      /next month/i, /soon/i, /urgent/i, /מתי/i,
    ],
    weight: 2,
  },
  {
    signal: 'reservation_intent',
    patterns: [
      /reserv/i, /book/i, /secure/i, /deposit/i,
      /hold/i, /להזמין/i, /לשריין/i,
    ],
    weight: 3,
  },
  {
    signal: 'visit_intent',
    patterns: [
      /visit/i, /see.*villa/i, /come.*bohol/i, /trip/i,
      /fly.*phil/i, /לבקר/i, /לראות/i,
    ],
    weight: 2,
  },
  {
    signal: 'legal_question',
    patterns: [
      /foreign.*own/i, /legal/i, /deed/i, /lease/i,
      /corporation/i, /בעלות/i, /חוקי/i,
    ],
    weight: 1,
  },
  {
    signal: 'financing_question',
    patterns: [
      /financ/i, /loan/i, /mortgage/i, /bdo/i,
      /installment/i, /מימון/i, /הלוואה/i,
    ],
    weight: 1,
  },
  {
    signal: 'roi_interest',
    patterns: [
      /roi/i, /return/i, /income/i, /rental/i,
      /yield/i, /profit/i, /תשואה/i, /הכנסה/i,
    ],
    weight: 1,
  },
  {
    signal: 'comparison',
    patterns: [
      /compar/i, /vs/i, /better than/i, /other.*project/i,
      /alternative/i, /להשוות/i,
    ],
    weight: 1,
  },
  {
    signal: 'contact_request',
    patterns: [
      /call me/i, /contact/i, /phone/i, /whatsapp/i,
      /email me/i, /speak.*agent/i, /תתקשר/i, /וואטסאפ/i,
    ],
    weight: 3,
  },
];

const HANDOFF_THRESHOLD = 2; // Number of weighted signals before suggesting handoff

class SalesChatbotAgent extends BaseAgent {
  constructor() {
    super(AGENT_SPECS.sales_chatbot);
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    const runId = randomUUID();

    try {
      const userMessage = input.query ?? '';

      if (!userMessage.trim()) {
        const output: AgentOutput = {
          success: false,
          error: 'No user message provided.',
          agentName: this.spec.name,
          runId,
          tokensUsed: { input: 0, output: 0 },
          costUsd: 0,
          duration: Date.now() - startTime,
        };
        await this.logRun(input, output);
        return output;
      }

      // 1. Load system prompt
      const systemPromptFile = await this.loadPrompt(this.spec.promptFile);
      const systemPrompt =
        systemPromptFile || this.getDefaultSystemPrompt();

      // 2. Detect language
      const language = this.detectLanguage(userMessage);

      // 3. Build conversation history
      const messages = (input.context?.messages as ChatMessage[]) ?? [];
      const conversationContext = this.buildConversationContext(messages);

      // 4. Detect lead signals across the full conversation
      const allMessages = [
        ...messages
          .filter((m) => m.role === 'user')
          .map((m) => m.content),
        userMessage,
      ];
      const allText = allMessages.join(' ');
      const leadSignals = this.detectLeadSignals(allText);

      // 5. Build the knowledge-grounded prompt
      const fullUserMessage = this.buildUserMessage({
        userMessage,
        language,
        conversationContext,
        leadSignals,
      });

      // 6. Call LLM
      const llmResult = await this.callLLM(systemPrompt, fullUserMessage, {
        maxTokens: 800,
        temperature: 0.7,
      });

      // 7. Parse response - David now returns plain text, not JSON
      const responseMessage = this.buildGroundedResponse(
        llmResult.content.trim(),
        language,
        userMessage,
        leadSignals
      );
      const sources = this.inferSources(userMessage);

      // 8. Check for handoff suggestion
      const signalWeight = this.calculateSignalWeight(leadSignals);
      const suggestHandoff = signalWeight >= HANDOFF_THRESHOLD;
      const handoffReason = suggestHandoff
        ? this.buildHandoffReason(leadSignals)
        : undefined;

      const chatResponse: ChatResponse = {
        message: responseMessage,
        language,
        sources,
        leadSignals,
        suggestHandoff,
        handoffReason,
      };

      const output: AgentOutput = {
        success: true,
        data: chatResponse,
        agentName: this.spec.name,
        runId,
        tokensUsed: {
          input: llmResult.tokensInput,
          output: llmResult.tokensOutput,
        },
        costUsd: llmResult.costUsd,
        duration: Date.now() - startTime,
      };

      await this.logRun(input, output);
      return output;
    } catch (error) {
      const output: AgentOutput = {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error in SalesChatbotAgent',
        agentName: this.spec.name,
        runId,
        tokensUsed: { input: 0, output: 0 },
        costUsd: 0,
        duration: Date.now() - startTime,
      };

      await this.logRun(input, output);
      return output;
    }
  }

  private detectLanguage(text: string): 'en' | 'he' {
    const hebrewChars = (text.match(HEBREW_REGEX) || []).length;
    return hebrewChars > 0 ? 'he' : 'en';
  }

  private sanitizeResponse(response: string, language: 'en' | 'he'): string {
    let clean = response.replace(/[\u2010-\u2015\u05BE]/g, '-').trim();

    if (language === 'he') {
      clean = clean
        .replace(/PHP\s?35,?000,?000/gi, '1,650,000 ש"ח')
        .replace(/PHP\s?32,?500,?000/gi, '1,535,000 ש"ח')
        .replace(/PHP\s?200,?000/gi, '9,999 ש"ח')
        .replace(/[^\n.!?]*\bPHP\b[^\n.!?]*[.!?]?/gi, '')
        .replace(/[^\n.!?]*\bUSD\b[^\n.!?]*[.!?]?/gi, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }

    return clean;
  }

  private buildGroundedResponse(
    response: string,
    language: 'en' | 'he',
    userMessage: string,
    leadSignals: string[]
  ): string {
    if (
      language === 'he' &&
      (leadSignals.includes('budget_mention') || leadSignals.includes('legal_question'))
    ) {
      const villa = /\bC\b/i.test(userMessage) ? 'C' : 'D';
      const price = villa === 'C' ? '1,650,000 ש"ח' : '1,535,000 ש"ח';
      return `וילה ${villa} מוצעת במחיר ${price}. היא כוללת 263.78 מ"ר, 4 חדרי שינה, בריכה פרטית וגג עם ג'קוזי. למשקיע זר קיימים 3 פתרונות בעלות: Deed of Assignment, Leasehold 25+25, Domestic Corporation. לפרטים: WhatsApp שיווק +639542555553 | WhatsApp משרד +639958565865. האם תרצה שאסביר איזה פתרון מתאים למטרת ההשקעה שלך?`;
    }

    return this.sanitizeResponse(response, language);
  }

  private detectLeadSignals(text: string): string[] {
    const signals: string[] = [];

    for (const { signal, patterns } of LEAD_SIGNAL_PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          if (!signals.includes(signal)) {
            signals.push(signal);
          }
          break;
        }
      }
    }

    return signals;
  }

  private calculateSignalWeight(signals: string[]): number {
    let weight = 0;

    for (const signal of signals) {
      const def = LEAD_SIGNAL_PATTERNS.find((p) => p.signal === signal);
      if (def) {
        weight += def.weight;
      }
    }

    return weight;
  }

  private buildHandoffReason(signals: string[]): string {
    const reasons: string[] = [];

    if (signals.includes('reservation_intent'))
      reasons.push('expressed reservation/booking intent');
    if (signals.includes('contact_request'))
      reasons.push('requested direct contact');
    if (signals.includes('budget_mention'))
      reasons.push('discussed budget/pricing');
    if (signals.includes('timeline_mention'))
      reasons.push('mentioned timeline/urgency');
    if (signals.includes('visit_intent'))
      reasons.push('wants to visit the property');

    if (reasons.length === 0) reasons.push('multiple qualification signals detected');

    return `Lead shows high intent: ${reasons.join(', ')}. Recommend WhatsApp handoff to sales team.`;
  }

  private buildConversationContext(messages: ChatMessage[]): string {
    if (messages.length === 0) return '';

    // Take the last 10 messages to keep context manageable
    const recent = messages.slice(-10);
    const lines = recent.map(
      (m) => `${m.role === 'user' ? 'Visitor' : 'Agent'}: ${m.content}`
    );

    return lines.join('\n');
  }

  private buildUserMessage(ctx: {
    userMessage: string;
    language: 'en' | 'he';
    conversationContext: string;
    leadSignals: string[];
  }): string {
    const parts: string[] = [];

    parts.push(`Detected language: ${ctx.language === 'he' ? 'Hebrew' : 'English'}`);
    parts.push(`Lead signals detected so far: ${ctx.leadSignals.length > 0 ? ctx.leadSignals.join(', ') : 'none yet'}`);

    if (ctx.conversationContext) {
      parts.push(`\nConversation so far:\n${ctx.conversationContext}`);
    }

    parts.push(`\nNew visitor message: "${ctx.userMessage}"`);

    parts.push(`\nProperty facts for grounding your response:`);
    parts.push(`- Project: ${PROPERTY_KB.project.name} by ${PROPERTY_KB.project.developer}`);
    parts.push(`- Location: ${PROPERTY_KB.project.locationDetail}`);
    if (ctx.language === 'he') {
      parts.push(`- Villa C: 1,650,000 ש"ח`);
      parts.push(`- Villa D: 1,535,000 ש"ח`);
      parts.push(`- Reservation: 9,999 ש"ח`);
    } else {
      parts.push(`- Villa C: ${PROPERTY_KB.villas.villaC.priceFormatted.php}`);
      parts.push(`- Villa D: ${PROPERTY_KB.villas.villaD.priceFormatted.php}`);
    }
    parts.push(`- Specs: ${PROPERTY_KB.villas.specs.floorArea}, ${PROPERTY_KB.villas.specs.bedrooms} bedrooms, ${PROPERTY_KB.villas.specs.stories} stories`);
    parts.push(`- Features: ${PROPERTY_KB.villas.specs.features.join(', ')}`);
    parts.push(`- Floor plan: Ground: ${PROPERTY_KB.villas.specs.floors.ground}. Second: ${PROPERTY_KB.villas.specs.floors.second}. Third: ${PROPERTY_KB.villas.specs.floors.third}. Roof deck: ${PROPERTY_KB.villas.specs.floors.roofDeck}`);
    parts.push(`- Villa C lot: ${PROPERTY_KB.villas.villaC.lotArea}. Villa D lot: ${PROPERTY_KB.villas.villaD.lotArea}`);
    parts.push(`- Availability: ${PROPERTY_KB.project.sold.join(', ')} SOLD. ${PROPERTY_KB.project.available.join(', ')} available.`);
    if (ctx.language !== 'he') {
      parts.push(`- Income: ${PROPERTY_KB.income.monthlyAverage}/month average at ${PROPERTY_KB.income.occupancyRate} occupancy. Peak: ${PROPERTY_KB.income.monthlyPeak}. Regular: ${PROPERTY_KB.income.monthlyRegular}`);
      parts.push(`- Annual gross: ${PROPERTY_KB.income.annualGross}. Market avg occupancy: ${PROPERTY_KB.income.marketAverageOccupancy} (ours is ${PROPERTY_KB.income.performanceAdvantage})`);
    }
    parts.push(`- ROI: ${PROPERTY_KB.income.roiAnnual} gross, ${PROPERTY_KB.income.roiNet} net. 5-year: ${PROPERTY_KB.income.roi5Year} cumulative, ${PROPERTY_KB.income.appreciation5Year} appreciation`);
    parts.push(`- Tourism: ${PROPERTY_KB.tourism.cumulativeGrowth}. 2025 arrivals: ${PROPERTY_KB.tourism.arrivals[2025].total.toLocaleString()} (${PROPERTY_KB.tourism.arrivals[2025].note})`);
    parts.push(`- Tourism recognition: ${PROPERTY_KB.tourism.recognition.join('; ')}`);
    parts.push(`- Payment: ${PROPERTY_KB.payment.schedule}${ctx.language === 'he' ? '' : ` - reservation ${PROPERTY_KB.payment.reservation}`}`);
    parts.push(`- Payment breakdown: ${PROPERTY_KB.payment.breakdown.phase1}; ${PROPERTY_KB.payment.breakdown.phase2}; ${PROPERTY_KB.payment.breakdown.phase3}`);
    parts.push(`- Legal structures: ${PROPERTY_KB.legal.structures.map(s => `${s.name}${s.popularity ? ' (' + s.popularity + ')' : ''}: ${s.desc}`).join('; ')}`);
    parts.push(`- Double tax treaty: ${PROPERTY_KB.legal.doubleTaxTreaty}. Remote process: ${PROPERTY_KB.legal.remoteProcess}`);
    parts.push(`- BDO financing: ${PROPERTY_KB.payment.bdoFinancing}`);
    parts.push(`- Property management: ${PROPERTY_KB.propertyManagement.model}. Fee: ${PROPERTY_KB.propertyManagement.fee}. ${PROPERTY_KB.propertyManagement.ownerBenefit}`);
    parts.push(`- Infrastructure: Airport ${PROPERTY_KB.infrastructure.airport.current2025} passengers. ${PROPERTY_KB.infrastructure.airport.flights}`);
    parts.push(`- 3rd Bridge: ${PROPERTY_KB.infrastructure.thirdBridge.cost}, ${PROPERTY_KB.infrastructure.thirdBridge.status}. Impact: ${PROPERTY_KB.infrastructure.thirdBridge.impact}`);
    parts.push(`- JW Marriott: ${PROPERTY_KB.infrastructure.jwMarriott.site}, ${PROPERTY_KB.infrastructure.jwMarriott.status}`);
    parts.push(`- Panglao Shores: ${PROPERTY_KB.infrastructure.panglaoShores.investment}, ${PROPERTY_KB.infrastructure.panglaoShores.components}`);
    parts.push(`- Competitors: BGC condo ${PROPERTY_KB.realEstateMarket.competitors.manilaCondoBGC.price} yields ${PROPERTY_KB.realEstateMarket.competitors.manilaCondoBGC.yield}. Tel Aviv: ${PROPERTY_KB.realEstateMarket.competitors.telAviv.yield} yield. ${PROPERTY_KB.realEstateMarket.competitors.telAviv.note}`);
    parts.push(`- STR market: ${PROPERTY_KB.realEstateMarket.strMarket.totalListings} listings, ${PROPERTY_KB.realEstateMarket.strMarket.composition}. Luxury villa ADR: ${PROPERTY_KB.realEstateMarket.strMarket.luxuryVillaADR}, occupancy ${PROPERTY_KB.realEstateMarket.strMarket.luxuryVillaOccupancy}`);
    parts.push(`- Economy: Bohol GDP ${PROPERTY_KB.economy.boholGDP2024}, growth ${PROPERTY_KB.economy.gdpGrowth}. FDI real estate: ${PROPERTY_KB.economy.fdiRealEstate2024}`);
    parts.push(`- Israel comparison: ${PROPERTY_KB.economy.israelCostComparison}`);
    parts.push(`- 5-year math (Villa D): ${PROPERTY_KB.fiveYearMath.villaD.initialInvestment} → Year 5 total value ${PROPERTY_KB.fiveYearMath.villaD.year5TotalValue}, gain ${PROPERTY_KB.fiveYearMath.villaD.year5TotalGain}, ROI ${PROPERTY_KB.fiveYearMath.villaD.year5ROI}. Break-even: ${PROPERTY_KB.fiveYearMath.breakEvenYears}`);
    parts.push(`- Bali comparison: ${PROPERTY_KB.realEstateMarket.baliComparison}`);
    parts.push(`- Phuket comparison: ${PROPERTY_KB.realEstateMarket.phuketComparison}`);
    parts.push(`- Attractions: ${PROPERTY_KB.attractions.natural.slice(0, 5).join('; ')}`);
    parts.push(`- Lifestyle: ${PROPERTY_KB.attractions.lifestyle.join('; ')}`);
    if (ctx.language === 'he') {
      parts.push(`- Israeli context: Companies in PH: ${PROPERTY_KB.israeliContext.israeliCompaniesInPH.join(', ')}. Visitor growth: ${PROPERTY_KB.israeliContext.israeliVisitorGrowth}. ${PROPERTY_KB.israeliContext.doubleTaxTreaty}`);
      parts.push(`- Panglao price comparison: ${PROPERTY_KB.israeliContext.priceComparison.panglaoVilla}`);
      parts.push(`- Yield: ${PROPERTY_KB.israeliContext.yieldComparison}. Cost of living: ${PROPERTY_KB.israeliContext.costOfLiving}`);
    } else {
      parts.push(`- Filipino context: ${PROPERTY_KB.filipinoContext.mainMessage}. BGC comparison: ${PROPERTY_KB.filipinoContext.bgcComparison}`);
      parts.push(`- BDO details: ${PROPERTY_KB.filipinoContext.bdoDetails}`);
    }
    parts.push(`- Global comparisons: ${PROPERTY_KB.globalComparisons.pricingRule} Korea: ${PROPERTY_KB.koreanContext.touristDominance}.`);
    parts.push(`- Virtual tour: ${PROPERTY_KB.externalLinks.virtualTour}`);
    parts.push(`- Objection handling available for: too expensive, too far, foreign ownership, tourism risk, need to think, management concerns`);
    parts.push(`- WhatsApp Marketing: ${PROPERTY_KB.whatsapp.marketing}`);
    parts.push(`- WhatsApp Office: ${PROPERTY_KB.whatsapp.office}`);

    parts.push(`
Now respond to the visitor's message. Write ONLY your reply as plain text - no JSON, no markdown, no formatting. Just natural conversation like a WhatsApp message.

Language: ${ctx.language === 'he' ? 'Hebrew (use shekels only, never PHP or USD, mention all 3 legal ownership solutions when relevant)' : 'English (use PHP only, mention BDO financing for Filipino buyers)'}

Remember:
- You are David, a real person. Talk like one.
- Include at least one specific number
- Keep it under 150 words
- End with one question that moves the conversation forward
- If the visitor is ready to buy, suggest WhatsApp: ${PROPERTY_KB.whatsapp.office}
- Never use: amazing, incredible, dream home, once in a lifetime
- Never use em/en dashes, only regular hyphens
- Ground every claim in the property facts above`);

    return parts.join('\n');
  }

  private inferSources(userMessage: string): string[] {
    const sources: string[] = [];
    const lower = userMessage.toLowerCase();

    if (/price|cost|how much|כמה|מחיר/.test(lower)) sources.push('pricing');
    if (/roi|return|income|yield|תשואה/.test(lower)) sources.push('income_data');
    if (/spec|bedroom|pool|sqm|jacuzzi/.test(lower)) sources.push('villa_specs');
    if (/location|where|beach|marriott|mithi/.test(lower)) sources.push('location');
    if (/pay|reserv|deposit|schedule/.test(lower)) sources.push('payment_terms');
    if (/legal|own|foreign|deed|lease|corp/.test(lower)) sources.push('legal_structures');
    if (/financ|loan|bdo|mortgage/.test(lower)) sources.push('financing');
    if (/tour|airport|bridge|growth/.test(lower)) sources.push('tourism_data');

    if (sources.length === 0) sources.push('general');

    return sources;
  }

  private getDefaultSystemPrompt(): string {
    return `You are a sales assistant chatbot for Panglao Prime Villas, a luxury villa investment project in Bohol, Philippines by Blue Everest Asset Group Holding Inc.

Your role:
- Answer visitor questions about the villas, pricing, ROI, location, legal structures, and payment terms
- Qualify leads by detecting buying signals
- Guide high-intent visitors toward contacting the sales team via WhatsApp

You are knowledgeable, professional, and helpful. You respond in the language the visitor uses.

Key facts you must know:
- Villa C: PHP 35,000,000 (PHP 35,000,000 for Israeli market), lot 192.85 sqm
- Villa D: PHP 32,500,000 (PHP 32,500,000 for Israeli market), lot 182.03 sqm
- Villa A and B are SOLD. Only C and D remain.
- 263.78 sqm floor area, 4 bedrooms all en-suite, private pool (15.08 sqm), rooftop jacuzzi (6.37 sqm), 3 stories + roof deck
- Monthly income: PHP 395,000 average (peak Dec-Feb: PHP 400-450K) at 65% occupancy (market avg 49%)
- ROI: 17-25% gross, 12-18% net. 5-year cumulative: 136.9%. 5-year appreciation: +80.9%
- Location: Between JW Marriott (under construction) and Mithi Resort, 60 seconds walk to beach
- Payment: 25/55/20 schedule. Reservation PHP 200,000 (PHP 200,000)
- BDO financing: up to 70% LTV, 15-year terms, ~6% interest (Filipino buyers)
- Tourism: 1.43M visitors in 2025 (record), +166% since 2022. UNESCO Global Geopark.
- Airport: 2.22M passengers, expanding to 4M by 2030. 12 daily Manila flights.
- 3rd Bridge: PHP 7.15B, French-funded, 20-40% land appreciation historically
- 3 legal structures: Deed of Assignment (most popular), Leasehold 25+25, Domestic Corporation
- Israel-Philippines double tax treaty since 1997. Remote purchase possible.
- Professional Airbnb management: 20-25% fee, fully passive income
- Luxury villa STR segment undersupplied (78% of listings are 1BR/rooms)

Communication rules:
- All visitors: use PHP only for every price and monetary amount
- Hebrew visitors: emphasize legal structures, formal but warm tone
- English visitors: use PHP prices, mention BDO financing for Filipinos
- Every response must include at least one specific number
- Never use: amazing, incredible, dream home, once in a lifetime
- Never use em/en dashes, only regular hyphens
- Always include WhatsApp Office (+639958565865) when suggesting contact
- Ground all claims in verified property data. Never fabricate information.
- If uncertain about something, direct the visitor to WhatsApp for detailed answers.

Output format: JSON with message, sources, and leadSignals fields.`;
  }
}

export const salesChatbot = new SalesChatbotAgent();
