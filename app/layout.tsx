import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://insory.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Insory — Create Magical QR Proposal Experiences",
    template: "%s | Insory",
  },
  description:
    "Create unforgettable, location-locked proposal experiences with beautiful QR codes. Pick a meaningful place, craft your question, and share the magic. Works worldwide on any phone.",
  keywords: [
    "proposal",
    "QR code proposal",
    "marriage proposal",
    "romantic proposal",
    "location-based proposal",
    "will you marry me",
    "proposal idea",
    "valentine proposal",
    "creative proposal",
    "QR code",
    "insory",
  ],
  authors: [{ name: "Insory" }],
  creator: "Insory",
  publisher: "Insory",

  /* ── Open Graph ── */
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Insory",
    title: "Insory — Make Your Proposal Unforgettable",
    description:
      "Create a magical, location-locked QR code proposal. Your partner scans, follows a hint, arrives at your special place, and discovers a beautiful question. Works worldwide.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Insory — QR Code Proposal Experience",
      },
    ],
  },

  /* ── Twitter / X ── */
  twitter: {
    card: "summary_large_image",
    title: "Insory — Make Your Proposal Unforgettable",
    description:
      "Create a magical, location-locked QR code proposal experience. Pick a place, write your question, share the QR. Works on any phone, worldwide.",
    images: [`${SITE_URL}/og-image.png`],
    creator: "@insoryapp",
  },

  /* ── Robots ── */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  /* ── Misc ── */
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  category: "lifestyle",
};

/* ── JSON-LD Structured Data ── */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Insory",
  url: SITE_URL,
  description:
    "Create unforgettable, location-locked proposal experiences with beautiful QR codes.",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "28.00",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "2847",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#1a0a1a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <FloatingHearts />
        {children}
      </body>
    </html>
  );
}

function FloatingHearts() {
  const hearts = ['💕', '💖', '💗', '💝', '❤️', '💘'];
  return (
    <div className="floating-hearts">
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="heart"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
            fontSize: `${14 + Math.random() * 16}px`,
          }}
        >
          {hearts[i % hearts.length]}
        </span>
      ))}
    </div>
  );
}
