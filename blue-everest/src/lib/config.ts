export const SITE_CONFIG = {
  name: "Blue Everest Asset Group Holding Inc.",
  shortName: "Blue Everest",
  domain: "blue-everest.com",
  url: "https://blue-everest.com",
  email: "ceo@blue-everest.com",
  facebook: "https://www.facebook.com/BlueEverestGroup",
  whatsapp: {
    marketing: "+639542555553",
    office: "+639958565865",
  },
  whatsappLinks: {
    marketing: "https://wa.me/message/5T6FVMO63HG3A1",
    office: "https://wa.me/639958565865",
  },
} as const;

export const PORTFOLIO_PROJECTS = [
  {
    id: "panglao-prime-villas",
    name: "Panglao Prime Villas",
    location: "Panglao, Bohol",
    type: "Luxury Investment Villas",
    status: "For Sale" as const,
    featured: true,
    description:
      "Four luxury investment villas between JW Marriott and Mithi Resort, 60 seconds from Panglao Beach. Only 2 villas remaining. Visit the project website for full details and availability.",
    image: "/images/exterior/hero-aerial.webp",
    gallery: [
      "/images/exterior/hero-aerial.webp",
      "/images/exterior/panglao-rear.webp",
    ],
    link: "/panglao-prime-villas",
  },
  {
    id: "resort-puerto-galera",
    name: "Resort Puerto Galera",
    location: "Puerto Galera, Mindoro",
    type: "Boutique Resort",
    status: "Completed" as const,
    featured: false,
    description:
      "A luxurious resort located in the idyllic coastal setting of Puerto Galera. Designed with clean, minimalistic lines and a Mediterranean-inspired aesthetic, the resort combines natural light, open spaces, and elegant archways to create a serene, relaxing environment.",
    image: "/images/portfolio/puerto-galera-hero.webp",
    gallery: [
      "/images/portfolio/puerto-galera-hero.webp",
      "/images/portfolio/puerto-galera/render-4.webp",
      "/images/portfolio/puerto-galera/render-5.webp",
    ],
    scope: ["Site Assessment", "Architectural Design", "Sustainable Material", "Landscape Integration"],
  },
  {
    id: "villa-pampanga",
    name: "Villa Pampanga",
    location: "Pampanga",
    type: "Premium Residence",
    status: "Completed" as const,
    featured: false,
    description:
      "Villa Pampanga is a premium residential project designed with modern luxury and serene living in mind. Set against a picturesque backdrop, the villa blends contemporary architectural elements with natural surroundings to create a tranquil and sophisticated retreat.",
    image: "/images/portfolio/villa-pampanga.webp",
    gallery: [
      "/images/portfolio/villa-pampanga.webp",
      "/images/portfolio/villa-pampanga-2.webp",
      "/images/portfolio/villa-pampanga-3.webp",
    ],
    scope: ["Site Analysis", "Architectural Planning", "Structural Development", "Interior Detailing"],
  },
  {
    id: "4-storey-pampanga",
    name: "4 Storey Building",
    location: "Angeles, Pampanga",
    type: "Apartment Condominium",
    status: "Completed" as const,
    featured: false,
    description:
      "This four-story apartment condominium in Angeles, Pampanga, features a modern minimalist design with clean lines and functional beauty. Crisp white walls create a sense of openness, contrasted by bold black railings for a contemporary touch. The neutral tones enhance its timeless, sophisticated appeal, offering a stylish yet simple urban retreat.",
    image: "/images/portfolio/4-storey-pampanga-2.webp",
    gallery: [
      "/images/portfolio/4-storey-pampanga-2.webp",
      "/images/portfolio/4-storey-pampanga-3.webp",
    ],
    scope: ["Ideation & Layout", "Flooring Installation", "Construction", "Custom Fabrication"],
  },
  {
    id: "villa-3-clark",
    name: "Villa 3",
    location: "Clark, Pampanga",
    type: "Luxury Villa",
    status: "Completed" as const,
    featured: false,
    description:
      "A bold, contemporary villa in Clark featuring dramatic stone accent walls, sculptural LED lighting, and an open-plan living space with a floating staircase. The exterior boasts a sleek infinity pool and sun deck surrounded by expansive lawns, creating a striking contrast between raw natural materials and ultra-modern design.",
    image: "/images/portfolio/villa-3-clark.webp",
    gallery: [
      "/images/portfolio/villa-3-clark.webp",
      "/images/portfolio/villa-3-clark-2.webp",
    ],
    scope: ["Conceptualization", "Design Refinement", "Procurement", "Construction"],
  },
  {
    id: "villa-9-clark",
    name: "Villa 9",
    location: "Clark, Pampanga",
    type: "Modern Villa",
    status: "Completed" as const,
    featured: false,
    description:
      "A pristine white modernist villa with clean geometric lines, featuring a covered pergola with poolside dining, a luxurious marble bathroom with freestanding tub, and a landscaped driveway lined with palm trees. Every detail reflects refined simplicity and sophisticated resort-style living.",
    image: "/images/portfolio/villa-9-clark.webp",
    gallery: [
      "/images/portfolio/villa-9-clark.webp",
      "/images/portfolio/villa-9-clark-2.webp",
    ],
    scope: ["Site Analysis", "Architectural Planning", "Structural Development", "Interior Detailing"],
  },
  {
    id: "villa-22-clark",
    name: "Villa 22",
    location: "Clark, Pampanga",
    type: "Luxury Villa",
    status: "Completed" as const,
    featured: false,
    description:
      "Villa 22, nestled in the heart of Clark, Pampanga, is a stunning embodiment of luxurious design, characterized by its grand architectural style and expansive landscape areas that stretch across the property. Meticulously designed with opulent finishes and spacious interiors, creating an atmosphere of refined elegance.",
    image: "/images/portfolio/villa-22-clark.webp",
    gallery: [
      "/images/portfolio/villa-22-clark.webp",
      "/images/portfolio/villa-22/kitchen.webp",
    ],
    scope: ["Sourcing", "Exterior & Interior Finishing", "Building Plan", "Construction"],
  },
] as const;

export const COMPANY_INFO = {
  tagline: "From Vision to Value",
  description:
    "Blue Everest Asset Group is a real estate development and investment company focused on creating high-value properties in emerging and high-growth markets.",
  fullDescription:
    "We specialize in identifying strategic land opportunities, developing innovative project concepts, and transforming them into profitable real estate assets - from boutique villas to full-scale developments. Our approach combines smart investment strategy, deep market understanding, and hands-on project execution, ensuring every project is designed for maximum value and long-term growth.",
  services: [
    {
      name: "Land Acquisition",
      description: "Identifying high-potential locations in emerging markets before peak pricing.",
    },
    {
      name: "Real Estate Development",
      description: "Transforming strategic land into premium investment-grade properties.",
    },
    {
      name: "Investment Structuring",
      description: "Ownership frameworks that maximize returns for international investors.",
    },
    {
      name: "Asset Management",
      description: "End-to-end management delivering verified rental income via Airbnb and hospitality channels.",
    },
  ],
  markets: [
    "Panglao, Bohol",
    "Clark, Pampanga",
    "Puerto Galera, Mindoro",
    "Angeles, Pampanga",
    "El Nido, Palawan",
    "Mindanao",
    "Metro Manila",
    "Siquijor",
  ],
} as const;

// Panglao Prime Villas data (case study for investment page)
export const VILLA_DATA = {
  villaC: {
    id: "villa-c",
    name: "Villa C",
    price: {
      php: 35_000_000,
      phpFormatted: "PHP 35,000,000",
      ilsFormatted: "PHP 35,000,000",
    },
  },
  villaD: {
    id: "villa-d",
    name: "Villa D",
    price: {
      php: 32_500_000,
      phpFormatted: "PHP 32,500,000",
      ilsFormatted: "PHP 32,500,000",
    },
  },
} as const;

export const VIRTUAL_TOURS = [
  {
    id: "4-storey",
    name: "4 Storey Building",
    location: "Angeles, Pampanga",
    image: "/images/portfolio/4-storey-pampanga-2.webp",
    tourUrl:
      "https://momento360.com/e/uc/60fadd12e9034476af0ae40c5cebec97?utm_campaign=embed&utm_source=other&size=medium&display-plan=true&upload-key=2c4dd881295e450e843c09b0e26f8509",
  },
  {
    id: "villa-22",
    name: "Villa 22",
    location: "Clark, Pampanga",
    image: "/images/portfolio/villa-22-clark.webp",
    tourUrl:
      "https://momento360.com/e/uc/c730b8067f8648708c315b4770332f62?utm_campaign=embed&utm_source=other&size=medium&display-plan=true&upload-key=73dfb649cc344f2fa70ebb108e33e835",
  },
  {
    id: "villa-9",
    name: "Villa 9",
    location: "Clark, Pampanga",
    image: "/images/portfolio/villa-9-clark.webp",
    tourUrl: "https://editor.rollinom.co.il/360/?id=1632983088",
  },
  {
    id: "beachfront",
    name: "Beachfront",
    location: "Philippines",
    image: null,
    tourUrl:
      "https://kuula.co/share/collection/7HMGx?logo=1&info=0&logosize=96&fs=1&vr=0&initload=0&thumbs=1&margin=10",
  },
] as const;

export const INVESTMENT_DATA = {
  monthlyIncome: 395_000,
  monthlyIncomeFormatted: "PHP 395,000",
  annualRoi: "17-25%",
  occupancy: "65%",
  tourists2025: "1,427,362",
  airportPassengers: "2.22M",
  luxuryADR: "PHP 6,000-8,400+",
} as const;
