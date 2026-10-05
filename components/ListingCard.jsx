import Link from 'next/link';
import Img from './Img';
import { MapPin, Clock, Users } from 'lucide-react';

export const hrefFor = (t) => `/${t.kind === 'journey' ? 'journeys' : 'experiences'}/${t.slug}`;

export default function ListingCard({ t, variant = 'grid' }) {
  if (variant === 'list') {
    return (
      <Link href={hrefFor(t)} className="group block border-t border-ink/15 pt-6">
        <div className="grid grid-cols-12 gap-4 md:gap-8">
          <div className="col-span-5 md:col-span-3 relative aspect-4/3 overflow-hidden bg-stone-100">
            <Img src={t.photos[0]} alt={t.title} sizes="(min-width: 768px) 25vw, 40vw" className="card-img object-cover" />
          </div>
          <div className="col-span-7 md:col-span-6">
            <p className="eyebrow text-stone-500 mb-2 flex items-center gap-1.5"><MapPin size={11} strokeWidth={1.5} /> {t.place} · {t.duration}</p>
            <h3 className="display text-2xl md:text-3xl tracking-tightest leading-[1.05] mb-2">{t.title}</h3>
            <p className="text-sm text-stone-500 leading-relaxed hidden md:block">{t.tagline}</p>
          </div>
          <div className="hidden md:flex col-span-3 flex-col items-end justify-end text-right">
            <p className="eyebrow text-stone-500 mb-1">From</p>
            <p className="display text-4xl tracking-tightest">${t.price.toLocaleString()}</p>
            <p className="eyebrow text-stone-500 mt-1">per person</p>
          </div>
        </div>
      </Link>
    );
  }
  return (
    <Link href={hrefFor(t)} className="group block">
      <div className="relative aspect-editorial overflow-hidden bg-stone-100 mb-4">
        <Img src={t.photos[0]} alt={t.title} className="card-img object-cover" />
        <div className="absolute top-3 left-3 eyebrow bg-bone/95 px-2.5 py-1">{t.kind === 'journey' ? `${t.days}-day journey` : t.category || 'Experience'}</div>
        <div className="absolute bottom-3 right-3 eyebrow bg-ink/85 text-bone px-3 py-1.5 backdrop-blur-sm">from ${t.price.toLocaleString()}</div>
      </div>
      <p className="eyebrow text-stone-500 mb-1 flex items-center gap-1.5"><MapPin size={10} strokeWidth={1.5} /> {t.place}</p>
      <h3 className="display text-xl md:text-2xl tracking-tightest leading-[1.1] mb-1">{t.title}</h3>
      <p className="text-xs text-stone-500 flex items-center gap-3"><span className="flex items-center gap-1"><Clock size={11} /> {t.duration}</span><span className="flex items-center gap-1"><Users size={11} /> up to {t.maxPeople}</span></p>
    </Link>
  );
}
