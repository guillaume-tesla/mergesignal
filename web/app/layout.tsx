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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mergesignal.example',
  ),
  title: 'MergeSignal — Prove your AI coding rollout is working',
  description:
    'Connect AI usage to shipped work and review quality. Know what to scale, fix, or stop without reading prompts or ranking engineers.',
  applicationName: 'MergeSignal',
  alternates: { canonical: '/' },
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    title: 'MergeSignal — Prove your AI coding rollout is working',
    description:
      'Know what to scale, fix, or stop with evidence-backed AI rollout decisions.',
    images: [
      {
        url: '/og.png',
        width: 1672,
        height: 941,
        alt: 'MergeSignal — Prove your AI coding rollout is working.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MergeSignal — Prove your AI coding rollout is working',
    description:
      'Know what to scale, fix, or stop with evidence-backed AI rollout decisions.',
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
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
