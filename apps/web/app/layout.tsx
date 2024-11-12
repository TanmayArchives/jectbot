import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import "./globals.css"
import "./page.module.css"
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "CryptoBot",
  description: "Cryptocurrency Trading Bot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} h-full`}>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-background text-text antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
