export type Locale = "en" | "he";

export interface Translations {
  nav: {
    home: string;
    about: string;
    villas: string;
    investment: string;
    location: string;
    ownership: string;
    contact: string;
    reserve: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    cta: string;
    ctaSecondary: string;
  };
  stats: {
    monthlyIncome: string;
    monthlyIncomeLabel: string;
    annualRoi: string;
    annualRoiLabel: string;
    occupancy: string;
    occupancyLabel: string;
    toBeach: string;
    toBeachLabel: string;
  };
  villaShowcase: {
    title: string;
    subtitle: string;
    villaC: {
      name: string;
      price: string;
      tagline: string;
    };
    villaD: {
      name: string;
      price: string;
      tagline: string;
    };
    specs: {
      area: string;
      bedrooms: string;
      pool: string;
      stories: string;
    };
    viewDetails: string;
    sold: string;
  };
  investment: {
    title: string;
    subtitle: string;
    pillars: {
      title: string;
      description: string;
    }[];
  };
  locationSection: {
    title: string;
    subtitle: string;
    landmarks: string[];
  };
  cta: {
    title: string;
    subtitle: string;
    whatsappMarketing: string;
    whatsappOffice: string;
    email: string;
    or: string;
  };
  footer: {
    company: string;
    tagline: string;
    quickLinks: string;
    contactUs: string;
    legal: string;
    privacy: string;
    terms: string;
    disclaimer: string;
    copyright: string;
    whatsappMarketing: string;
    whatsappOffice: string;
  };
  villaDetail: {
    specifications: string;
    floorArea: string;
    lotArea: string;
    stories: string;
    bedrooms: string;
    pool: string;
    features: string[];
    monthlyIncome: string;
    annualRoi: string;
    reserveNow: string;
    reserveFee: string;
    gallery: string;
    exterior: string;
    interior: string;
    livingAreas: string;
    kitchen: string;
    bedroomsGallery: string;
    bathrooms: string;
    poolArea: string;
    rooftop: string;
    investmentSnapshot: string;
    financing: string;
  };
  investmentPage: {
    title: string;
    subtitle: string;
    roiCalculator: string;
    marketData: string;
    projections: string;
    financing: string;
    financingDescription: string;
  };
  locationPage: {
    title: string;
    subtitle: string;
    infrastructure: string;
    tourism: string;
    whyPanglao: string;
  };
  ownershipPage: {
    title: string;
    subtitle: string;
    structures: {
      name: string;
      description: string;
      bestFor: string;
      advantages: string[];
    }[];
    process: string;
    processSteps: string[];
  };
  aboutPage: {
    title: string;
    subtitle: string;
    story: string;
    vision: string;
    visionText: string;
    mission: string;
    missionText: string;
  };
  contactPage: {
    title: string;
    subtitle: string;
    form: {
      name: string;
      email: string;
      phone: string;
      country: string;
      villaInterest: string;
      villaC: string;
      villaD: string;
      either: string;
      timeline: string;
      message: string;
      submit: string;
      submitting: string;
      success: string;
    };
  };
  common: {
    learnMore: string;
    getInTouch: string;
    backToHome: string;
    onlyTwoLeft: string;
    verifiedIncome: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    simulation: string;
    groups: {
      dashboard: string;
      marketing: string;
      sales: string;
      system: string;
    };
    tabs: {
      live: string;
      history: string;
      today: string;
      gallery: string;
      calendar: string;
      agents: string;
      reports: string;
      salesAgents: string;
      chatbot: string;
    };
    sections: {
      overview: string;
      todaysPosts: string;
      campaigns: string;
      postGallery: string;
      leadPipeline: string;
      analytics: string;
      budget: string;
      agents: string;
      agentReports: string;
      salesActivity: string;
      publishingCalendar: string;
      knowledge: string;
      chat: string;
      communityAgent: string;
      autoposter: string;
      settings: string;
      content: string;
      conversations: string;
    };
    overview: {
      campaignDay: string;
      budgetSpent: string;
      totalLeads: string;
      creativesReady: string;
      awaitingLaunch: string;
      blockers: string;
      completed: string;
      goLiveTitle: string;
    };
    posts: {
      allMarkets: string;
      allPhases: string;
      allStatuses: string;
      editPost: string;
      saveChanges: string;
      primaryText: string;
      headlines: string;
      status: string;
      showMore: string;
      showLess: string;
      draft: string;
      ready: string;
      published: string;
      paused: string;
    };
    leads: {
      funnelTitle: string;
      trackerTitle: string;
      noLeads: string;
      openSheet: string;
    };
    analytics: {
      weeklyTargets: string;
      websiteAnalytics: string;
      metaAds: string;
      googleAds: string;
      dailySpend: string;
    };
    budget: {
      phase1: string;
      phase2: string;
      summary: string;
      villaSpecs: string;
      paymentStructure: string;
      fxRates: string;
      ownershipOptions: string;
    };
    settings: {
      businessLinks: string;
      driveAssets: string;
      platforms: string;
      contentRules: string;
    };
    statuses: {
      planned: string;
      active: string;
      paused: string;
      completed: string;
      notSetup: string;
      phase2: string;
    };
    common: {
      israel: string;
      philippines: string;
      both: string;
      awareness: string;
      consideration: string;
      conversion: string;
      open: string;
      view: string;
      setup: string;
    };
  };
}
