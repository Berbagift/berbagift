import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BagiTHR - Reward Communities Beautifully",
  description: "BagiTHR is a platform to send digital rewards, run creator campaigns, and celebrate together — transparently and securely.",
};

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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
