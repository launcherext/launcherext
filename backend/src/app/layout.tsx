import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/core/Providers";

// Primary sans-serif font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Monospace font
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DexDrip | Banner Generator",
  description: "Generate stunning DexScreener banners in seconds. No design skills required.",
  metadataBase: new URL('https://dexdrip.fun'),
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#050505' },
    { media: '(prefers-color-scheme: light)', color: '#050505' },
  ],
  openGraph: {
    title: "DexDrip | Banner Generator",
    description: "Generate stunning DexScreener banners in seconds. No design skills required.",
    url: 'https://dexdrip.fun',
    siteName: 'DexDrip',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 675,
        alt: 'DexDrip - Banner Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "DexDrip | Banner Generator",
    description: "Generate stunning DexScreener banners in seconds. No design skills required.",
    images: ['/og-image.png'],
  },
  icons: {
    icon: "/mainlogo.svg",
    shortcut: "/mainlogo.svg",
    apple: "/mainlogo.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DexDrip',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrains.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
