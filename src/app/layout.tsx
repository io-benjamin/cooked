import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Am I Cooked? | Financial Reality Check",
  description: "Find out if you're financially cooked compared to others your age, city, and industry. Anonymous, brutally honest, actually helpful.",
  keywords: ["finance", "money", "budgeting", "salary", "debt", "savings", "calculator"],
  openGraph: {
    title: "Am I Cooked? | Financial Reality Check",
    description: "Find out if you're financially cooked. Anonymous, brutally honest, actually helpful.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Am I Cooked?",
    description: "Find out if you're financially cooked.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
