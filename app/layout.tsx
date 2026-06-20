import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";

import "./globals.css";

import AuthProvider from "@/components/auth/AuthProvider";
import SyncProvider from "@/components/sync/SyncProvider";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mind AI",
  description: "AI Parenting Companion for Mochi & Matcha",
  manifest: "/manifest.webmanifest",
  applicationName: "Mind AI",
  appleWebApp: {
    capable: true,
    title: "Mind AI",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "Mind AI",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#ec4899",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={beVietnamPro.variable}>
        <AuthProvider>
          <SyncProvider>{children}</SyncProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
