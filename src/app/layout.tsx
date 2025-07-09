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
    <div
      className={cn(
        "min-h-screen bg-secondary font-sans antialiased pb-34 sm:pb-20 select-none overflow-x-hidden",
        fontSans.variable,
      )}
    >
      <Header />
      <SessionProvider>
        <PhoneCheckWrapper>
          <div className="mx-auto px-4 py-4 overflow-x-hidden">{children}</div>
        </PhoneCheckWrapper>
      </SessionProvider>
      <Footer />
    </div>
  );
}
