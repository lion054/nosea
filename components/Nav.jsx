'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import Logo from './Logo';
import { SITE, waLink } from '@/lib/site';

export default function Nav({ links }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled || open ? 'bg-bone/90 backdrop-blur-md border-b border-ink/10' : 'bg-bone/60 backdrop-blur-sm'}`}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        <Link href="/" aria-label="Nosea Safaris, home"><Logo priority className="h-12 md:h-14 w-auto" /></Link>
        <nav className="hidden md:flex items-center gap-9" aria-label="Main">
          {links.map((n) => <Link key={n.href} href={n.href} className="text-sm link-underline tracking-tight">{n.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <a href={waLink('Hello Nosea Safaris, I would like to plan a trip.')} className="hidden md:inline-flex items-center gap-2 bg-ink text-bone px-5 py-3 text-sm hover:bg-sienna transition"><Phone size={14} strokeWidth={1.6} /> WhatsApp</a>
          <button onClick={() => setOpen(!open)} className="md:hidden w-10 h-10 flex items-center justify-center" aria-label="Menu" aria-expanded={open}>{open ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-bone border-t border-ink/10">
          <nav className="px-6 py-6 flex flex-col gap-4" aria-label="Mobile">
            {links.map((n) => <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="display text-3xl tracking-tightest">{n.label}</Link>)}
            <a href={waLink()} className="eyebrow mt-2">WhatsApp {SITE.phone}</a>
          </nav>
        </div>
      )}
    </header>
  );
}
