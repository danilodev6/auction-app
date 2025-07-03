import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/app/Header";
import { Barlow } from "next/font/google";
import PhoneCheckWrapper from "@/components/PhoneCheckWrapper";
import { SessionProvider } from "next-auth/react";
import Footer from "./Footer";

const fontSans = Barlow({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "TB subastas",
  description: "Auction live app",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={cn(
          "min-h-screen bg-secondary font-sans antialiased pb-28 sm:pb-16 select-none",
          fontSans.variable,
        )}
      >
        <Header />
        <SessionProvider>
          <PhoneCheckWrapper>
            <div className="mx-auto px-4 py-4">{children}</div>
          </PhoneCheckWrapper>
        </SessionProvider>
        <Footer />
      </body>
    </html>
  );
}
