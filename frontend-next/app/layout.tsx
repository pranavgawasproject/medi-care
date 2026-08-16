import type { Metadata } from 'next'
import { Space_Grotesk, Inter, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

const SITE_URL = 'https://medicare-pranav.vercel.app/'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'MediCare — Smart Healthcare Management Platform',
    template: '%s · MediCare',
  },
  description:
    'MediCare is an enterprise healthcare platform connecting patients, practitioners, and administrators. Book consultations, manage prescriptions, lab reports, medical records, and clinic workflows.',
  applicationName: 'MediCare',
  keywords: [
    'medicare',
    'clinic management',
    'patient booking',
    'medical records',
    'prescriptions',
    'lab reports',
    'healthcare software',
    'clinic operations',
    'appointment scheduling',
  ],
  authors: [{ name: 'MediCare' }],
  creator: 'MediCare',
  publisher: 'MediCare',
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/vite.svg',
    shortcut: '/vite.svg',
    apple: '/vite.svg',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'MediCare',
    title: 'MediCare — Smart Healthcare Management Platform',
    description:
      'Enterprise healthcare platform connecting patients, practitioners, and administrators.',
    locale: 'en_US',
    images: [{ url: '/vite.svg', width: 64, height: 64, alt: 'MediCare logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MediCare — Smart Healthcare Management Platform',
    description:
      'Enterprise healthcare platform connecting patients, practitioners, and administrators.',
    images: ['/vite.svg'],
  },
  category: 'HealthApplication',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'MediCare',
      url: SITE_URL,
      logo: `${SITE_URL}vite.svg`,
      description:
        'Clinic operations platform connecting patients, practitioners, and administrators.',
    },
    {
      '@type': 'WebSite',
      name: 'MediCare',
      url: SITE_URL,
      description:
        'Modern clinic operations platform for booking consultations and managing medical notes.',
      publisher: { '@type': 'Organization', name: 'MediCare' },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'MediCare',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web',
      description:
        'A modern clinic operations platform connecting patients, practitioners, and administrators for booking consultations, managing prescriptions, lab reports, and medical records.',
      url: SITE_URL,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <Providers>{children}</Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <GoogleAnalytics />
      </body>
    </html>
  )
}
