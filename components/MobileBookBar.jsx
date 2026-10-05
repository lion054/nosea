'use client';
import { useEffect, useState } from 'react';

// On phones the booking panel sits below the story; this keeps the price and a "check dates" button in thumb reach until the panel itself is on screen.
export default function MobileBookBar({ price, label = 'Check dates' }) {
  const [hide, setHide] = useState(false);
  useEffect(() => {
    const el = document.getElementById('book');
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setHide(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const go = () => document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <div className={`lg:hidden fixed inset-x-0 bottom-0 z-30 bg-bone/95 backdrop-blur-md border-t border-ink/10 transition-transform duration-300 ${hide ? 'translate-y-full' : ''}`} style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <div className="leading-tight"><p className="eyebrow text-stone-500">From</p><p className="display text-3xl tracking-tightest">${price.toLocaleString()}<span className="eyebrow text-stone-500 ml-1.5 align-middle">pp</span></p></div>
        <button type="button" onClick={go} className="flex-1 max-w-[230px] bg-ink text-bone h-12 eyebrow active:bg-sienna transition">{label}</button>
      </div>
    </div>
  );
}
