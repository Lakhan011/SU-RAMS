import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SU-RAMS Admin Panel",
  description: "Sharda University Ph.D. Management System",
  icons: {
    icon: "/favi-icon.png",
  },
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full" suppressHydrationWarning>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
