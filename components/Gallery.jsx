'use client';
import { useState } from 'react';
import Img from './Img';

export default function Gallery({ photos, title, stock }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="relative aspect-16/10 bg-stone-100 overflow-hidden">
        <Img src={photos[i]} alt={`${title}, photo ${i + 1}`} sizes="(min-width: 1024px) 60vw, 100vw" priority={i === 0} quality={75} className="object-cover" />
        {stock && <span className="absolute bottom-3 left-3 eyebrow bg-ink/70 text-bone px-2.5 py-1">Illustrative photo</span>}
      </div>
      {photos.length > 1 && (
        <div className="grid grid-cols-5 gap-2 mt-2">
          {photos.slice(0, 5).map((p, k) => <button key={k} onClick={() => setI(k)} className={`relative aspect-4/3 overflow-hidden ${k === i ? 'ring-2 ring-sienna' : 'opacity-70 hover:opacity-100'}`}><Img src={p} alt="" sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" /></button>)}
        </div>
      )}
    </div>
  );
}
