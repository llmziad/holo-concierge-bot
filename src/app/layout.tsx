import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial display face — used with restraint for headlines and hero figures.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  // TODO: replace with the production domain once branding is finalised.
  metadataBase: new URL("https://example.com"),
  title: {
    default: "Dubai Real Estate Intelligence",
    template: "%s · Dubai Real Estate Intelligence",
  },
  description:
    "Five questions. AI-matched Dubai properties with market intelligence on every card. Know instantly whether a price is fair and what the investment could return.",
  applicationName: "Dubai Real Estate Intelligence",
  openGraph: {
    type: "website",
    siteName: "Dubai Real Estate Intelligence",
    title: "Dubai Real Estate Intelligence",
    description:
      "AI-matched Dubai properties with market intelligence on every card.",
    locale: "en_AE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dubai Real Estate Intelligence",
    description:
      "AI-matched Dubai properties with market intelligence on every card.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
