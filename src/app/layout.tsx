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
  title: "PhotoPrivacy Explorer | Audit & Wipe Hidden Image Metadata",
  description: "Detect hidden GPS, camera specs, and shooting angles in your photos. A premium metadata audit tool to visualize and wipe sensitive EXIF data before sharing.",
  keywords: ["exif editor", "photo privacy", "gps metadata audit", "wipe image data", "photo location tracker", "security", "privacy tools"],
  openGraph: {
    title: "PhotoPrivacy Explorer | Audit & Wipe Hidden Image Metadata",
    description: "Detect hidden GPS data and wipe sensitive EXIF headers in 1-click.",
    url: "https://photo-privacy-explorer.vercel.app/",
    siteName: "PhotoPrivacy Explorer",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PhotoPrivacy Explorer Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PhotoPrivacy Explorer | Audit & Wipe Hidden Image Metadata",
    description: "Audit your photo's hidden storytelling metadata and protect your privacy.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
