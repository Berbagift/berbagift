import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Berbagift — Celebrate Every Gift, Beyond Borders",
    template: "%s | Berbagift"
  },
  description: "Wrap digital assets in beautiful custom envelopes and send them with a personal message anywhere in the world—instantly and securely on Stellar.",
  keywords: [
    "Berbagift",
    "digital gifting",
    "Stellar network",
    "RPK token",
    "crypto gifts",
    "borderless gifting",
    "red envelope",
    "BagiTHR",
    "Web3 rewards",
    "community giveaways"
  ],
  authors: [{ name: "Berbagift Team" }],
  openGraph: {
    title: "Berbagift — Celebrate Every Gift, Beyond Borders",
    description: "Wrap digital assets in beautiful custom envelopes and send them with a personal message anywhere in the world—instantly and securely on Stellar.",
    url: "https://berbagift.com",
    siteName: "Berbagift",
    images: [
      {
        url: "/logo/Brandlogo.svg",
        width: 800,
        height: 600,
        alt: "Berbagift Branding Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Berbagift — Celebrate Every Gift, Beyond Borders",
    description: "Wrap digital assets in beautiful custom envelopes and send them with a personal message anywhere in the world—instantly on Stellar.",
    images: ["/logo/Brandlogo.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} font-sans h-full antialiased`}
    >
      <head>
        <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/uicons-regular-rounded/css/uicons-regular-rounded.css' />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <ToastContainer position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
