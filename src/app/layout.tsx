import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { Modal } from "~/components/modal";
import { Toaster } from "~/components/ui/sonner";
import { ModalProvider } from "~/context/ModalContext";
import { TRPCReactProvider } from "~/trpc/react";
import Navbar from "./_components/navbar";
import { ThemeProvider } from "./_components/theme-provider";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Myxr",
  description: "Upload sounds to Discord with ease",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="h-screen">
        <TRPCReactProvider>
          <ThemeProvider attribute="class" enableSystem>
            <ModalProvider>
              <div className="flex h-full flex-col">
                <Navbar />
                <div className="flex h-full">
                  <div className="mx-auto h-full max-w-7xl flex-1 grow p-2 sm:py-10">
                    {children}
                    <SessionProvider>
                      <Modal />
                    </SessionProvider>
                  </div>
                </div>
                <Toaster />
              </div>
            </ModalProvider>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
