'use client';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function HeroSearch() {
  const router = useRouter();
  function go(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const q = (f.get('q') || '').toString().trim();
    router.push(`/${f.get('kind')}${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  }
  return (
    <form onSubmit={go} className="text-ink bg-bone border border-ink/15 shadow-[0_20px_60px_-15px_rgba(26,26,26,0.35)] p-2 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2">
      <label className="px-4 py-3"><span className="eyebrow text-ink/60 block mb-1">Where or what?</span><input name="q" placeholder="Victoria Falls, game drive, Namibia…" className="bg-transparent w-full text-base focus:outline-none" /></label>
      <label className="px-4 py-3 md:border-l border-ink/15"><span className="eyebrow text-ink/60 block mb-1">I want</span>
        <select name="kind" className="bg-transparent w-full text-base focus:outline-none cursor-pointer"><option value="experiences">A day experience</option><option value="journeys">A multi-day journey</option></select></label>
      <button className="bg-ink text-bone px-8 py-4 flex items-center justify-center gap-2 hover:bg-sienna transition"><Search size={18} strokeWidth={1.5} /><span className="eyebrow">Search</span></button>
    </form>
  );
}
