import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "~/components/ui/sonner";
import { TRPCReactProvider } from "~/trpc/react";
import { HydrateClient } from "~/trpc/server";
import Navbar from "./_components/navbar";

export const metadata: Metadata = {
  title: "Myxr",
  description: "Upload sounds to Discord with ease",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body>
        <TRPCReactProvider>
          <ThemeProvider attribute="class">
            <HydrateClient>
              <div className="flex h-screen flex-col">
                <Navbar />
                <NextTopLoader
                  showSpinner={false}
                  speed={600}
                  initialPosition={0.2}
                  crawlSpeed={100}
                />
                <div className="mx-auto w-full max-w-7xl flex-1 grow p-4 sm:py-10">
                  {children}
                </div>
                <footer className="grow-0 border-t py-4 text-center text-sm text-muted-foreground">
                  <p>
                    Created by{" "}
                    <a
                      href="https://github.com/jacxk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Jacxk
                    </a>
                    . View the project on{" "}
                    <a
                      href="https://github.com/jacxk/myxr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      GitHub
                    </a>
                  </p>
                </footer>
              </div>
              <Toaster />
            </HydrateClient>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
