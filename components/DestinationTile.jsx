import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Img from './Img';
import { seasonLabel } from '@/lib/destinations';

export default function DestinationTile({ d, photo, count, className = '', big = false }) {
  return (
    <Link href={`/destinations/${d.slug}`} className={`group relative block overflow-hidden bg-ink ${className}`}>
      <Img src={photo} alt={d.name} sizes={big ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'} className="card-img object-cover opacity-90 group-hover:opacity-100 transition" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-bone">
        <p className="eyebrow text-sienna-light mb-2">{d.country}{count ? ` · ${count} ${count === 1 ? 'trip' : 'trips'}` : ''}</p>
        <h3 className={`display tracking-tightest leading-none ${big ? 'text-4xl md:text-6xl' : 'text-3xl md:text-4xl'}`}>{d.name}</h3>
        <p className="text-sm text-bone/75 mt-2 line-clamp-1">{d.tag}</p>
        <p className="eyebrow text-bone/60 mt-3">Best: {seasonLabel(d)}</p>
      </div>
      <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-bone/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><ArrowUpRight size={15} className="text-bone" /></div>
    </Link>
  );
}
