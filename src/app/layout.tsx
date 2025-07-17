import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/app/Header";
import { Barlow } from "next/font/google";
import PhoneCheckWrapper from "@/components/PhoneCheckWrapper";
import FacebookBrowserHandler from "@/components/FacebookBrowserHandler";
import { SessionProvider } from "next-auth/react";
import Footer from "./Footer";
import { headers } from "next/headers";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check if server detected Facebook browser
  const headersList = await headers();
  const isFacebookBrowser = headersList.get("x-facebook-browser") === "true";

  return (
    <html lang="en">
      <head>
        {isFacebookBrowser && <meta name="facebook-browser" content="true" />}
      </head>
      <body
        className={cn(
          "min-h-screen bg-secondary font-sans antialiased pb-34 sm:pb-20 select-none overflow-x-hidden",
          fontSans.variable,
        )}
      >
        <Header />
        <SessionProvider>
          <PhoneCheckWrapper>
            <div className="mx-auto px-4 py-4 overflow-x-hidden">
              {children}
            </div>
          </PhoneCheckWrapper>
        </SessionProvider>
        <Footer />
        <FacebookBrowserHandler />
      </body>
    </html>
  );
}

// import type { Metadata } from "next";
// import "./globals.css";
// import { cn } from "@/lib/utils";
// import { Header } from "@/app/Header";
// import { Barlow } from "next/font/google";
// import PhoneCheckWrapper from "@/components/PhoneCheckWrapper";
// import { SessionProvider } from "next-auth/react";
// import Footer from "./Footer";
//
// const fontSans = Barlow({
//   subsets: ["latin"],
//   variable: "--font-sans",
//   weight: ["500"],
// });
//
// export const metadata: Metadata = {
//   title: "TB subastas",
//   description: "Auction live app",
//   icons: {
//     icon: "/favicon.ico",
//   },
// };
//
// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <div
//       className={cn(
//         "min-h-screen bg-secondary font-sans antialiased pb-34 sm:pb-20 select-none overflow-x-hidden",
//         fontSans.variable,
//       )}
//     >
//       <Header />
//       <SessionProvider>
//         <PhoneCheckWrapper>
//           <div className="mx-auto px-4 py-4 overflow-x-hidden">{children}</div>
//         </PhoneCheckWrapper>
//       </SessionProvider>
//       <Footer />
//     </div>
//   );
// }
