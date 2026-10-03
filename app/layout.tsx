import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Syne, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppStateProvider } from '@/lib/context/app-state-context';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Brandly.ai — Find the right creator. Build the right campaign.',
  description:
    'An AI-powered marketplace connecting brands with relevant influencers and UGC creators based on real campaign fit.',
  openGraph: {
    title: 'Brandly.ai — Find the right creator. Build the right campaign.',
    description:
      'An AI-powered marketplace connecting brands with relevant influencers and UGC creators based on real campaign fit.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brandly.ai — Find the right creator. Build the right campaign.',
    description:
      'An AI-powered marketplace connecting brands with relevant influencers and UGC creators based on real campaign fit.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${syne.variable} ${jetbrainsMono.variable} bg-slate-950 text-slate-100 min-h-screen`}
    >
      <body className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-300">
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
