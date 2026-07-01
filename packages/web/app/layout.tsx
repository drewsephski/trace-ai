import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
});

const siteTitle = 'Trace - Local-first AI agent workspace';
const siteDescription =
  'Trace is a local-first desktop app for running AI agents, managing files, using skills and MCP tools, and reviewing approvals from one workspace.';

const resolveMetadataBase = () => {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (!siteUrl) return new URL('http://localhost:3000');
  return new URL(siteUrl.startsWith('http://') || siteUrl.startsWith('https://') ? siteUrl : `https://${siteUrl}`);
};

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: siteTitle,
  description: siteDescription,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)', sizes: '32x32', type: 'image/png' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: 'Trace',
    type: 'website',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'Trace logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [{ url: '/twitter-image.png', alt: 'Trace logo' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${instrumentSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
