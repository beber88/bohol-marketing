import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://blue-everest.com/panglao-prime-villas"),
  title: {
    default: "Panglao Prime Villas | PHP 395,000/month Verified Income",
    template: "%s | Panglao Prime Villas",
  },
  description:
    "Luxury investment villas in Panglao, Bohol. PHP 395,000/month verified Airbnb income. 17-25% annual ROI. Between JW Marriott and Panglao Beach. Only 2 villas remaining.",
  keywords: [
    "Panglao villas",
    "Bohol investment",
    "luxury villa Philippines",
    "Airbnb investment",
    "Panglao real estate",
    "PHP 395000 monthly income",
    "Blue Everest",
    "villa for sale Bohol",
  ],
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "https://blue-everest.com/panglao-prime-villas",
    siteName: "Panglao Prime Villas",
    title: "Panglao Prime Villas | PHP 395,000/month Verified Income",
    description:
      "Luxury investment villas in Panglao, Bohol. 17-25% annual ROI. Only 2 remaining.",
    images: [
      {
        url: "/images/exterior/hero-aerial.webp",
        width: 1200,
        height: 630,
        alt: "Panglao Prime Villas - Luxury Investment Properties",
      },
    ],
  },
  robots: { index: true, follow: true },
};

export default function VillasSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
