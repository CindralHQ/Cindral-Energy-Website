import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css'; // Global styles

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cindral Energy | Sustainable Solar, Wind & Hybrid Solutions',
  description: 'Calculate custom solar, wind, and hybrid solutions with real-time dynamic pricing, government subsidies, and accurate labor costs.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-[#F8FAF7] text-[#121814] selection:bg-[#5CE02A]/30 selection:text-[#008744]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
