import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sportsunity.gr";

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: "Sports Unit",
      description:
        "Connect, showcase, and grow in the professional sports network.",
      publisher: {
        "@id": `${baseUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/discovery?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "Sports Unit",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
        width: 512,
        height: 512,
      },
      sameAs: [],
    },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Sports Unit - Professional Sports Network",
    template: "%s | Sports Unit",
  },
  description:
    "Connect, showcase, and grow in the professional sports network. Join athletes, coaches, and scouts building the future of sports.",
  keywords: [
    "sports network",
    "athletes",
    "coaches",
    "scouts",
    "professional sports",
    "sports careers",
    "athlete profiles",
    "sports recruiting",
  ],
  authors: [{ name: "Sports Unit" }],
  creator: "Sports Unit",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://sportsunity.gr"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Sports Unit",
    title: "Sports Unit - Professional Sports Network",
    description:
      "Connect, showcase, and grow in the professional sports network. Join athletes, coaches, and scouts building the future of sports.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sports Unit - Professional Sports Network",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sports Unit - Professional Sports Network",
    description:
      "Connect, showcase, and grow in the professional sports network.",
    images: ["/og-image.png"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pt-16 pb-20 md:pb-0 bg-background`}
      >
        <Providers>
          <Header />
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
