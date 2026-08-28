import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Game of Life — Background Lab',
  description: 'An interactive Conway’s Game of Life background experiment.',
  openGraph: {
    title: 'Game of Life — Background Lab',
    description: 'An interactive Conway’s Game of Life background experiment.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Game of Life — Background Lab',
    description: 'An interactive Conway’s Game of Life background experiment.',
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
