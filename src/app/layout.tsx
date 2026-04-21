import type { Metadata } from "next";
import { Playfair_Display, Lora, Source_Serif_4, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";
import { ENV } from "@/lib/env";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OneMint — India's Most Trusted Knowledge Platform",
    template: "%s | OneMint",
  },
  description:
    "Trusted by 500,000+ readers. Expert articles on personal finance, technology, health, career, and more. Free tools & calculators. Zero spam.",
  keywords: [
    "personal finance India", "investing", "SIP calculator", "tax planning",
    "technology news", "health advice", "career tips", "Indian knowledge platform",
  ],
  authors: [{ name: "OneMint" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://onemint-alpha.vercel.app",
    siteName: "OneMint",
    title: "OneMint — India's Most Trusted Knowledge Platform",
    description: "Expert articles on finance, tech, health & more. Free tools. Zero spam.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@onemint",
  },
  robots: { index: true, follow: true },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sync theme init — MUST be before body to prevent FOUC */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="icon" href="/favicon.ico" />
        {/* SVG favicon for modern browsers */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
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
        {/* Plausible Analytics */}
        <script
          defer
          data-domain={ENV.PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.js"
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
