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
  metadataBase: new URL('https://game-of-life-background-lab.gavin-liam-b-3363.chatgpt.site'),
  title: 'Game of Life — Background Lab',
  description: 'An interactive Conway’s Game of Life background experiment.',
  openGraph: {
    title: 'Game of Life — Background Lab',
    description: 'An interactive Conway’s Game of Life background experiment.',
    type: 'website',
    images: [{ url: '/og.png', width: 1792, height: 1024, alt: 'Game of Life — Background Lab' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Game of Life — Background Lab',
    description: 'An interactive Conway’s Game of Life background experiment.',
    images: ['/og.png'],
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
