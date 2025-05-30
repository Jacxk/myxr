import "~/styles/globals.css";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { GoogleAdSense } from "next-google-adsense";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { PostHogProvider } from "~/components/PostHogProvider";
import { Toaster } from "~/components/ui/sonner";
import { TRPCReactProvider } from "~/trpc/react";
import { HydrateClient } from "~/trpc/server";
import { Footer } from "./_components/footer";
import Navbar from "./_components/navbar";

export const metadata: Metadata = {
  metadataBase: new URL("https://myxr.cc"),
  title: {
    default: "myxr - Discord Soundboard Manager",
    template: "%s | myxr - Discord Soundboard Manager",
  },
  description:
    "Upload, manage, and share custom sounds for your Discord soundboard. Create the perfect soundboard experience with myxr's easy-to-use sound management platform.",
  keywords: [
    "Discord soundboard",
    "sound management",
    "custom sounds",
    "Discord bot",
    "sound upload",
    "audio sharing",
    "Discord audio",
    "sound effects",
    "Discord sound effects",
    "Discord sound manager",
    "Discord audio bot",
    "Discord sound upload",
  ],
  authors: [{ name: "Jacxk" }],
  creator: "Jacxk",
  publisher: "Jacxk",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "myxr - Discord Soundboard Manager",
    description:
      "Upload, manage, and share custom sounds for your Discord soundboard. Create the perfect soundboard experience with myxr's easy-to-use sound management platform.",
    url: "https://myxr.cc",
    siteName: "myxr",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "myxr - Discord Soundboard Manager",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "myxr",
    description:
      "Upload, manage, and share custom sounds for your Discord soundboard. Create the perfect soundboard experience with myxr's easy-to-use sound management platform.",
    images: ["/og-image.jpg"],
  },
  category: "Discord Tools",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body>
        <GoogleAdSense />
        <ThemeProvider attribute="class">
          <PostHogProvider>
            <TRPCReactProvider>
              <HydrateClient>
                <div className="bg-background flex min-h-screen flex-col">
                  <Navbar />
                  <NextTopLoader
                    showSpinner={false}
                    speed={600}
                    initialPosition={0.2}
                    crawlSpeed={100}
                  />
                  {children}
                  <Footer />
                </div>
                <Toaster />
              </HydrateClient>
            </TRPCReactProvider>
          </PostHogProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
