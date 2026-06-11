import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, Noto_Sans_Hebrew } from "next/font/google";
import Script from "next/script";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-display-var",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-body-var",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const notoHebrew = Noto_Sans_Hebrew({
  variable: "--font-hebrew-var",
  subsets: ["hebrew"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blue-everest.com"),
  title: {
    default: "Blue Everest Asset Group | Real Estate Development & Investment",
    template: "%s | Blue Everest Asset Group",
  },
  description:
    "Blue Everest Asset Group is a real estate development and investment company focused on creating high-value properties in emerging and high-growth markets across the Philippines.",
  keywords: [
    "Blue Everest",
    "Panglao villas",
    "Bohol real estate",
    "Philippines investment property",
    "luxury villa Panglao",
    "Airbnb investment Philippines",
  ],
  authors: [{ name: "Blue Everest Asset Group Holding Inc." }],
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "https://blue-everest.com",
    siteName: "Blue Everest Asset Group",
    title: "Blue Everest Asset Group | Luxury Investment Properties",
    description:
      "Developing luxury investment villas in the Philippines. PHP 395,000/month verified income. 17-25% annual ROI.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Blue Everest Asset Group - Luxury Investment Properties",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blue Everest Asset Group | Luxury Investment Properties",
    description: "PHP 395,000/month verified Airbnb income. 17-25% annual ROI.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${playfair.variable} ${jakarta.variable} ${notoHebrew.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-04NZJT2C4V"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-04NZJT2C4V');
            gtag('config', 'AW-18095957436');
          `}
        </Script>

        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1599211187973958');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1599211187973958&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
