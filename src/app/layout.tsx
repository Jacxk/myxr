import "~/styles/globals.css";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { GoogleAdSense } from "next-google-adsense";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { PostHogProvider } from "~/components/PostHogProvider";
import { Toaster } from "~/components/ui/sonner";
import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";
import { HydrateClient } from "~/trpc/server";
import { Footer } from "./_components/footer";
import Navbar from "./_components/navbar";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_BASE_URL),
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
    icon: [
      { url: "/icons/favicon.ico" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-icon.png" },
      { url: "/icons/apple-icon-precomposed.png" },
      { url: "/icons/apple-icon-57x57.png", sizes: "57x57", type: "image/png" },
      { url: "/icons/apple-icon-60x60.png", sizes: "60x60", type: "image/png" },
      { url: "/icons/apple-icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/apple-icon-76x76.png", sizes: "76x76", type: "image/png" },
      {
        url: "/icons/apple-icon-114x114.png",
        sizes: "114x114",
        type: "image/png",
      },
      {
        url: "/icons/apple-icon-120x120.png",
        sizes: "120x120",
        type: "image/png",
      },
      {
        url: "/icons/apple-icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        url: "/icons/apple-icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        url: "/icons/apple-icon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        url: "/icons/android-icon-36x36.png",
        sizes: "36x36",
        type: "image/png",
      },
      {
        url: "/icons/android-icon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        url: "/icons/android-icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        url: "/icons/android-icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        url: "/icons/android-icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        url: "/icons/android-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      { url: "/icons/ms-icon-70x70.png", sizes: "70x70", type: "image/png" },
      {
        url: "/icons/ms-icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        url: "/icons/ms-icon-150x150.png",
        sizes: "150x150",
        type: "image/png",
      },
      {
        url: "/icons/ms-icon-310x310.png",
        sizes: "310x310",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title: "myxr - Discord Soundboard Manager",
    description:
      "Upload, manage, and share custom sounds for your Discord soundboard. Create the perfect soundboard experience with myxr's easy-to-use sound management platform.",
    url: env.NEXT_PUBLIC_BASE_URL,
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
