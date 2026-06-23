import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css'; // Global styles
import { GoogleAnalytics } from '@next/third-parties/google'


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://energy.cindral.org'),

  title:
    'Solar & Renewable Energy Solutions in Karjat, Neral, Panvel, Navi Mumbai | Cindral Energy',

  description:
    'Cindral Energy provides solar, wind, hybrid renewable energy systems, energy consulting, battery storage solutions, and sustainable infrastructure across Karjat, Neral, Alibaug, Navi Mumbai, Panvel, Lonavala, Murbad, Khopoli, and surrounding regions. We help homes, businesses, institutions, and communities reduce energy costs through clean and reliable power solutions.',

  keywords: [
    'Cindral Energy',
    'Solar Installation Karjat',
    'Solar Company Karjat',
    'Solar Panels Karjat',
    'Renewable Energy Karjat',

    'Solar Installation Neral',
    'Solar Company Neral',
    'Renewable Energy Neral',

    'Solar Installation Panvel',
    'Solar Company Panvel',
    'Renewable Energy Panvel',

    'Solar Installation Navi Mumbai',
    'Solar Company Navi Mumbai',
    'Renewable Energy Navi Mumbai',

    'Solar Installation Alibaug',
    'Solar Company Alibaug',

    'Solar Installation Lonavala',
    'Solar Company Lonavala',

    'Solar Installation Khopoli',
    'Solar Company Khopoli',

    'Solar Installation Murbad',
    'Solar Company Murbad',

    'Wind Energy Solutions',
    'Hybrid Energy Systems',
    'Battery Energy Storage',
    'Commercial Solar Solutions',
    'Residential Solar Solutions',
    'Industrial Solar Installation',
    'Renewable Energy Consultancy',
    'Sustainable Energy Solutions',
  ],

  openGraph: {
    title:
      'Cindral Energy | Solar, Wind & Hybrid Renewable Energy Solutions',
    description:
      'Trusted renewable energy partner serving Karjat, Neral, Alibaug, Navi Mumbai, Panvel, Lonavala, Murbad and Khopoli.',
    url: 'https://energy.cindral.org',
    siteName: 'Cindral Energy',
    images: [
      {
        url: '/Green.png',
        width: 1200,
        height: 630,
        alt: 'Cindral Energy Renewable Energy Solutions',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  icons: {
    icon: '/Green.png',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Cindral Energy',
    description:
      'Solar, Wind & Hybrid Renewable Energy Solutions across Maharashtra.',
    images: ['/Green.png'],
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-[#F8FAF7] text-[#121814] selection:bg-[#5CE02A]/30 selection:text-[#008744]" suppressHydrationWarning>
        {children}
      </body>

      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
    </html>
  );
}
