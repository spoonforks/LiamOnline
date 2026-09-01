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
  title: 'Liam Online',
  description: 'Portfolio of Liam Cunningham, MSc student focused on AI and metropolitan innovation.',
  icons: {
    icon: '/tools/lineArt.png',
    apple: '/tools/lineArt.png',
  },
  openGraph: {
    title: 'Liam Online',
    description: 'Portfolio of Liam Cunningham, MSc student focused on AI and metropolitan innovation.',
    type: 'website',
    images: [{ url: '/og.png', width: 1792, height: 1024, alt: 'Liam Cunningham portfolio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Liam Online',
    description: 'Portfolio of Liam Cunningham, MSc student focused on AI and metropolitan innovation.',
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
