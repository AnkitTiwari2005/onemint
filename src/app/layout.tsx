import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";
import { JsonLd } from "@/components/JsonLd";
import { buildWebSite, buildOrganization } from "@/lib/jsonld";

// ── Self-hosted fonts (downloaded from Google Fonts, same woff2 files) ────────
// Build-time network-independent — no Google CDN fetch during `next build`.
const playfair = localFont({
  variable: "--font-playfair",
  display: "swap",
  src: [
    { path: "../../public/fonts/playfair-display/playfair-display-latin-normal-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/playfair-display/playfair-display-latin-normal-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/playfair-display/playfair-display-latin-normal-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/playfair-display/playfair-display-latin-normal-700.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/playfair-display/playfair-display-latin-italic-400.woff2", weight: "400", style: "italic" },
    { path: "../../public/fonts/playfair-display/playfair-display-latin-italic-600.woff2", weight: "600", style: "italic" },
  ],
});

const lora = localFont({
  variable: "--font-lora",
  display: "swap",
  src: [
    { path: "../../public/fonts/lora/lora-latin-normal-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/lora/lora-latin-normal-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/lora/lora-latin-normal-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/lora/lora-latin-normal-700.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/lora/lora-latin-italic-400.woff2", weight: "400", style: "italic" },
    { path: "../../public/fonts/lora/lora-latin-italic-600.woff2", weight: "600", style: "italic" },
  ],
});

const sourceSerif = localFont({
  variable: "--font-source-serif",
  display: "swap",
  src: [
    { path: "../../public/fonts/source-serif-4/source-serif-4-latin-normal-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/source-serif-4/source-serif-4-latin-normal-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/source-serif-4/source-serif-4-latin-normal-700.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/source-serif-4/source-serif-4-latin-italic-400.woff2", weight: "400", style: "italic" },
  ],
});

const dmSans = localFont({
  variable: "--font-dm-sans",
  display: "swap",
  src: [
    { path: "../../public/fonts/dm-sans/dm-sans-latin-normal-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/dm-sans/dm-sans-latin-normal-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/dm-sans/dm-sans-latin-normal-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/dm-sans/dm-sans-latin-normal-700.woff2", weight: "700", style: "normal" },
  ],
});

const jetbrains = localFont({
  variable: "--font-jetbrains",
  display: "swap",
  src: [
    { path: "../../public/fonts/jetbrains-mono/jetbrains-mono-latin-normal-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/jetbrains-mono/jetbrains-mono-latin-normal-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/jetbrains-mono/jetbrains-mono-latin-normal-700.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/jetbrains-mono/jetbrains-mono-latin-italic-400.woff2", weight: "400", style: "italic" },
  ],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "OneMint — India's Most Trusted Knowledge Platform",
    template: "%s | OneMint",
  },
  description: "Expert articles on personal finance, technology, health, and careers. Free tools & calculators for better money decisions. Zero spam.",
  keywords: [
    "personal finance India", "investing", "SIP calculator", "tax planning",
    "technology news", "health advice", "career tips", "Indian knowledge platform",
  ],
  authors: [{ name: "OneMint", url: SITE_URL }],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "OneMint",
    title: "OneMint — India's Most Trusted Knowledge Platform",
    description: "Expert articles on personal finance, technology, health, and careers. Free tools & calculators for better money decisions. Zero spam.",
    images: [
      {
        url: 'https://www.onemint.in/og-image.png',
        width: 1200,
        height: 630,
        alt: "OneMint — India's Most Trusted Knowledge Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@one_mint_",
    images: ["https://www.onemint.in/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Bing Webmaster Tools site verification
  other: {
    'msvalidate.01': 'E16F05FA702AE155A6CBCA16F9362903',
  },
};

const fontVars = [
  playfair.variable,
  lora.variable,
  sourceSerif.variable,
  dmSans.variable,
  jetbrains.variable,
].join(" ");

// Synchronous theme init script — runs before first paint, prevents FOUC
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('onemint-prefs');
    var theme = stored ? JSON.parse(stored).theme : null;
    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        {/* Sync theme init — MUST be before body to prevent FOUC */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="icon" type="image/png" href="/icon.png" />
        {/* PWA theme colors */}
        <meta name="theme-color" content="#F8F7F4" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#111110" media="(prefers-color-scheme: dark)" />
        {/* PWA manifest + Apple meta */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="OneMint" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="OneMint" />
        {/* JSON-LD: WebSite (enables Sitelinks Search Box) + Organization */}
        <JsonLd data={buildWebSite()} />
        <JsonLd data={buildOrganization()} />
        {/* Google Analytics 4 — page-view tracking */}
        {/* ID driven by NEXT_PUBLIC_GA4_MEASUREMENT_ID env var */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? 'G-64VNWTB5ME'}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? 'G-64VNWTB5ME'}', { send_page_view: true });
            `,
          }}
        />
        {/* Google AdSense — site verification + ad serving */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9948709371742259"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${fontVars} min-h-screen flex flex-col`} suppressHydrationWarning>
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
