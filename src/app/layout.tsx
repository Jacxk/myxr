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
    default: "myxr",
    template: "%s | myxr",
  },
  description: "Upload sounds to Discord with ease",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Myxr",
    description: "Upload sounds to Discord with ease",
    url: "https://myxr.cc",
    siteName: "Myxr",
    type: "website",
    locale: "en_US",
    // TODO: Add images
    // images: "/og.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Myxr",
    description: "Upload sounds to Discord with ease",
    // TODO: Add images
    // images: "/og.png",
  },
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
                <div className="bg-background flex h-screen flex-col">
                  <Navbar />
                  <NextTopLoader
                    showSpinner={false}
                    speed={600}
                    initialPosition={0.2}
                    crawlSpeed={100}
                  />
                  {/* <div className="bg-background mx-auto w-full max-w-7xl flex-1 grow sm:py-10"> */}
                  {children}
                  {/* </div> */}
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
