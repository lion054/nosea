import Link from 'next/link';
import Logo from './Logo';
import { SITE, waLink } from '@/lib/site';

export default function Footer({ links }) {
  return (
    <footer className="bg-ink text-bone mt-24 grain relative">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <Logo variant="light" tagline className="h-28 w-auto mb-6" />
          <p className="text-bone/70 max-w-sm leading-relaxed">Locally owned, Harare-based. Day experiences and journeys across Zimbabwe and Southern Africa, planned by people who live here.</p>
        </div>
        <div className="md:col-span-3">
          <p className="eyebrow text-sienna-light mb-4">Explore</p>
          <ul className="space-y-2.5">{links.map((n) => <li key={n.href}><Link href={n.href} className="text-bone/80 hover:text-bone link-underline">{n.label}</Link></li>)}</ul>
        </div>
        <div className="md:col-span-4">
          <p className="eyebrow text-sienna-light mb-4">Talk to us</p>
          <ul className="space-y-2.5 text-bone/80">
            <li><a href={waLink('Hello Nosea Safaris')} className="hover:text-bone">WhatsApp {SITE.phone}</a></li>
            <li><a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="hover:text-bone">{SITE.phone}</a></li>
            <li><a href={`mailto:${SITE.email}`} className="hover:text-bone">{SITE.email}</a></li>
            <li>{SITE.base}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-bone/10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-bone/50">
          <span>© {new Date().getFullYear()} Nosea Safaris. All rights reserved.</span>
          <span>Booking and payments powered by Tanova.</span>
        </div>
      </div>
    </footer>
  );
}
