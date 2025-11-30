import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Navigation from "@/components/Navigation";
import { GoogleAnalytics } from '@next/third-parties/google'
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "TipNaDen.cz - Události a akce v České republice",
    template: "%s | TipNaDen.cz",
  },
  description:
    "Objevte nejlepší koncerty, divadla, festivaly a sportovní akce v celé České republice. Všechny události na jednom místě.",
  keywords: [
    "události",
    "akce",
    "koncerty",
    "divadla",
    "festivaly",
    "sport",
    "Česká republika",
    "Praha",
    "Brno",
    "Ostrava",
  ],
  authors: [{ name: "TipNaDen.cz" }],
  creator: "TipNaDen.cz",
  publisher: "TipNaDen.cz",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://tipnaden.cz"),
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    url: "https://tipnaden.cz",
    title: "TipNaDen.cz - Události a akce v České republice",
    description:
      "Objevte nejlepší koncerty, divadla, festivaly a sportovní akce v celé České republice.",
    siteName: "TipNaDen.cz",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TipNaDen.cz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TipNaDen.cz - Události a akce v České republice",
    description:
      "Objevte nejlepší koncerty, divadla, festivaly a sportovní akce.",
    images: ["/og-image.jpg"],
  },
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="cs">
        <head>
          {/* PWA Meta tagy */}
          <meta name="theme-color" content="#0f172a" />
          {/* Favicon */}
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link
            rel="icon"
            href="/android-chrome-192x192.png"
            type="image/png"
            sizes="192x192"
          />
          <link rel="apple-touch-icon" href="/android-chrome-192x192.png" />

          {/* Viewport */}
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=5"
          />
        </head>
        <body className={inter.className}>
          {/* ✅ GLOBAL ERROR BOUNDARY - Zachytí errory v celé aplikaci */}
          <ErrorBoundary>
            <Navigation />
            {children}
            <Footer />
          </ErrorBoundary>

          {/* Google Analytics */}
          {process.env.NEXT_PUBLIC_GA_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}