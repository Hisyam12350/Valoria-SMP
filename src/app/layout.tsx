import type { Metadata } from "next";
import { Press_Start_2P, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MusicPlayer } from "@/components/music-player";
import { BACKGROUND_IMAGE } from "@/lib/constants";
import Script from "next/script";

const minecraftFont = Press_Start_2P({
  weight: "400",
  variable: "--font-minecraft",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VALORIA SMP - Server Minecraft Survival Indonesia",
  description:
    "Server Minecraft Survival Indonesia terbaik dengan fitur lengkap, rank eksklusif, dan komunitas yang aktif. Join sekarang di play.valoriasmp.my.id",
  keywords: [
    "Minecraft",
    "Server",
    "SMP",
    "Survival",
    "Indonesia",
    "VALORIA",
    "Gaming",
    "Multiplayer",
  ],
  authors: [{ name: "VALORIA SMP Team" }],
  icons: {
    icon: "https://image2url.com/r2/default/images/1773117137406-9d62e3e7-6d56-4190-b725-f0ca7a59c0e6.jpg",
  },
  openGraph: {
    title: "VALORIA SMP - Server Minecraft Survival Indonesia",
    description: "Server Minecraft Survival Indonesia terbaik. Join sekarang!",
    url: "https://valoriasmp.my.id",
    siteName: "VALORIA SMP",
    type: "website",
    images: [
      {
        url: "https://image2url.com/r2/default/images/1773117137406-9d62e3e7-6d56-4190-b725-f0ca7a59c0e6.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VALORIA SMP - Server Minecraft Survival Indonesia",
    description: "Server Minecraft Survival Indonesia terbaik. Join sekarang!",
    images: [
      "https://image2url.com/r2/default/images/1773117137406-9d62e3e7-6d56-4190-b725-f0ca7a59c0e6.jpg",
    ],
  },
};

const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
const midtransScriptUrl = isProduction
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${minecraftFont.variable} ${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Midtrans Snap Script */}
        <Script
          src={midtransScriptUrl}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
        />

        {/* Fixed Background */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
        />

        {/* Dark Overlay */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10" />

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <MusicPlayer />
        </div>

        <Toaster />
      </body>
    </html>
  );
}
