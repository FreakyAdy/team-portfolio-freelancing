import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Triadict — Editorial websites for solo professionals",
  description: "Editorial brochure sites for solo professionals and boutique brands. Fixed price, 2–3 weeks, no surprises.",
  keywords: ["web design", "editorial websites", "boutique studio", "freelance web developer", "custom websites"],
  openGraph: {
    title: "Triadict — Editorial websites for solo professionals",
    description: "Editorial brochure sites for solo professionals and boutique brands. Fixed price, 2–3 weeks, no surprises.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Triadict — Editorial websites for solo professionals",
    description: "Editorial brochure sites for solo professionals and boutique brands. Fixed price, 2–3 weeks, no surprises.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}