'use client';
import { useRef, useState } from 'react';
import Img from './Img';

export default function Gallery({ photos, title, stock }) {
  const [i, setI] = useState(0);
  const strip = useRef(null);
  const onScroll = () => { const el = strip.current; if (el) setI(Math.round(el.scrollLeft / el.clientWidth)); };
  const goto = (k) => { setI(k); const el = strip.current; if (el) el.scrollTo({ left: k * el.clientWidth, behavior: 'smooth' }); };
  return (
    <div>
      {/* Phones: swipe through the photos. */}
      <div className="md:hidden relative -mx-6">
        <div ref={strip} onScroll={onScroll} className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none]" aria-label={`${title} photos`}>
          {photos.map((p, k) => <div key={k} className="relative aspect-[4/3] shrink-0 w-full snap-center bg-stone-100"><Img src={p} alt={`${title}, photo ${k + 1}`} sizes="100vw" priority={k === 0} quality={60} className="object-cover" /></div>)}
        </div>
        {photos.length > 1 && <div className="absolute bottom-0 inset-x-0 flex justify-center">{photos.map((_, k) => <button key={k} onClick={() => goto(k)} aria-label={`Photo ${k + 1}`} className="h-8 px-1 flex items-center"><span className={`block h-1.5 rounded-full transition-all ${k === i ? 'w-6 bg-bone' : 'w-1.5 bg-bone/60'}`} /></button>)}</div>}
        {stock && <span className="absolute top-3 left-3 eyebrow bg-ink/70 text-bone px-2.5 py-1">Illustrative photo</span>}
      </div>

      {/* Larger screens: a big photo with thumbnails. */}
      <div className="hidden md:block">
        <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
          <Img src={photos[i]} alt={`${title}, photo ${i + 1}`} sizes="(min-width: 1024px) 60vw, 100vw" priority={i === 0} quality={65} className="object-cover" />
          {stock && <span className="absolute bottom-3 left-3 eyebrow bg-ink/70 text-bone px-2.5 py-1">Illustrative photo</span>}
        </div>
        {photos.length > 1 && (
          <div className="grid grid-cols-5 gap-2 mt-2">
            {photos.slice(0, 5).map((p, k) => <button key={k} onClick={() => setI(k)} aria-label={`Show photo ${k + 1}`} className={`relative aspect-[4/3] overflow-hidden ${k === i ? 'ring-2 ring-sienna' : 'opacity-70 hover:opacity-100'}`}><Img src={p} alt="" sizes="120px" className="object-cover" /></button>)}
          </div>
        )}
      </div>
    </div>
  );
}
