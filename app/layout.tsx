import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import BootstrapClient from "@/components/BootstrapClient";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VeLearn - Learn Live, Build Real Skills, Get Career Ready",
  description:
    "VeLearn offers live online tech programs with expert mentors, real-world projects, and career guidance to help you build a successful future in technology.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <BootstrapClient />
        <ProtectedRoute>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ProtectedRoute>
      </body>
    </html>
  );
}