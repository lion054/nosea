import './globals.css';
import { Fraunces, Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Concierge from '@/components/Concierge';
import { SITE } from '@/lib/site';

// Self-hosted, subset, swap: no render-blocking request to a font CDN.
const display = Fraunces({ subsets: ['latin'], variable: '--nf-display', axes: ['opsz', 'SOFT'], style: ['normal', 'italic'], display: 'swap' });
const sans = Instrument_Sans({ subsets: ['latin'], variable: '--nf-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--nf-mono', weight: ['400', '500'], display: 'swap' });

const DESC = 'Day experiences and multi-day journeys across Zimbabwe, Namibia and Botswana, planned and led by a Harare-based local team. Live availability, instant online booking.';

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Nosea Safaris | Safaris and day experiences in Zimbabwe & Southern Africa', template: '%s | Nosea Safaris' },
  description: DESC,
  applicationName: 'Nosea Safaris',
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: 'Nosea Safaris', locale: 'en_ZW', url: SITE.url, title: 'Nosea Safaris | Experience the wilderness', description: DESC, images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Nosea Safaris, experience the wilderness' }] },
  twitter: { card: 'summary_large_image', title: 'Nosea Safaris | Experience the wilderness', description: DESC, images: ['/og.jpg'] },
  icons: { icon: [{ url: '/favicon.ico' }, { url: '/icon.png', type: 'image/png', sizes: '512x512' }], apple: '/apple-icon.png' },
  manifest: '/manifest.webmanifest',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  formatDetection: { telephone: false },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#1E1E1E', viewportFit: 'cover' };

const LINKS = [
  { href: '/experiences', label: 'Experiences' },
  { href: '/journeys', label: 'Journeys' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/plan', label: 'Plan a trip' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function RootLayout({ children }) {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'TravelAgency', '@id': `${SITE.url}/#org`, name: SITE.name, url: SITE.url, email: SITE.email, telephone: SITE.phone, logo: `${SITE.url}/icon.png`, image: `${SITE.url}/og.jpg`, slogan: SITE.tagline, priceRange: '$$', address: { '@type': 'PostalAddress', addressLocality: 'Harare', addressCountry: 'ZW' }, areaServed: ['Zimbabwe', 'Namibia', 'Botswana'], contactPoint: { '@type': 'ContactPoint', telephone: SITE.phone, contactType: 'customer service', availableLanguage: 'English' } },
      { '@type': 'WebSite', '@id': `${SITE.url}/#site`, url: SITE.url, name: SITE.name, publisher: { '@id': `${SITE.url}/#org` }, potentialAction: { '@type': 'SearchAction', target: `${SITE.url}/experiences?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
    ],
  };
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="bg-bone text-ink min-h-screen flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:bg-ink focus:text-bone focus:px-4 focus:py-3">Skip to content</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
        <Nav links={LINKS} />
        <main id="main" className="flex-1">{children}</main>
        <Footer links={LINKS} />
        <Concierge />
        {process.env.NEXT_PUBLIC_GA_ID && <><Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} strategy="lazyOnload" /><Script id="ga" strategy="lazyOnload">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}',{anonymize_ip:true});`}</Script></>}
      </body>
    </html>
  );
}
