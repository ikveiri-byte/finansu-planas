import type { Metadata, Viewport } from "next";
import { DM_Sans, Gabarito } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

const gabarito = Gabarito({
  subsets: ["latin", "latin-ext"],
  variable: "--font-gabarito",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Finansai",
  description: "Asmeninė finansų planavimo programėlė",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Finansai",
  },
};

export const viewport: Viewport = {
  themeColor: "#f2eee4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lt" className={`${dmSans.variable} ${gabarito.variable}`}>
      <body className="font-body min-h-screen bg-paper text-ink">{children}</body>
    </html>
  );
}
