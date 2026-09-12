import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { patrickHand, rogueScript } from "./ui/fonts";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Household",
  description: "Simple recipe and shopping list app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${patrickHand.variable} ${rogueScript.variable} h-full antialiased`}
    >
      <body className={`${patrickHand.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
