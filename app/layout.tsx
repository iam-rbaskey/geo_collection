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
  title: "Geo Collectibles Map App",
  description: "Futuristic dark mode geo-routing map app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Geo Collect",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0b0f14" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        width: '100vw', 
        height: '100vh',
        overflow: 'hidden', 
        background: '#0b0f14',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        WebkitOverflowScrolling: 'touch',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
      }}>{children}</body>
    </html>
  );
}
