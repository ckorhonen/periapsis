import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Periapsis - Interactive Orbital Mechanics",
  description:
    "An in-depth, interactive guide to orbital mechanics. Learn about gravity, orbits, delta-v, Hohmann transfers, and more through hands-on visualizations.",
  keywords: [
    "orbital mechanics",
    "space",
    "physics",
    "education",
    "interactive",
    "delta-v",
    "Hohmann transfer",
    "gravity",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a12]`}
      >
        {children}
      </body>
    </html>
  );
}
