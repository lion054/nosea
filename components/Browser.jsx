'use client';
import { useMemo, useState } from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import ListingCard from './ListingCard';

export default function Browser({ items, noun = 'trips', initialQuery = '' }) {
  const [q, setQ] = useState(initialQuery);
  const [cat, setCat] = useState('All');
  const [place, setPlace] = useState('All');
  const [sort, setSort] = useState('featured');
  const [view, setView] = useState('grid');
  const cats = useMemo(() => ['All', ...new Set(items.map((i) => i.category).filter(Boolean))], [items]);
  const places = useMemo(() => ['All', ...new Set(items.map((i) => i.place).filter(Boolean))], [items]);
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    let r = items.filter((i) => (cat === 'All' || i.category === cat) && (place === 'All' || i.place === place) && (!s || `${i.title} ${i.tagline} ${i.place} ${i.category}`.toLowerCase().includes(s)));
    if (sort === 'low') r = [...r].sort((a, b) => a.price - b.price);
    if (sort === 'high') r = [...r].sort((a, b) => b.price - a.price);
    if (sort === 'short') r = [...r].sort((a, b) => a.hours - b.hours);
    return r;
  }, [items, q, cat, place, sort]);
  const sel = 'bg-transparent border border-ink/20 px-3 h-12 md:h-11 text-base md:text-sm focus:outline-none focus:border-ink';
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between mb-8">
        <label className="relative flex-1 max-w-md"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${noun}`} className={`${sel} w-full pl-9`} /></label>
        <div className="flex gap-2 items-center overflow-x-auto md:overflow-visible md:flex-wrap -mx-6 px-6 md:mx-0 md:px-0 pb-1 [scrollbar-width:none]">
          {cats.length > 2 && <select value={cat} onChange={(e) => setCat(e.target.value)} className={sel} aria-label="Category">{cats.map((c) => <option key={c}>{c}</option>)}</select>}
          {places.length > 2 && <select value={place} onChange={(e) => setPlace(e.target.value)} className={sel} aria-label="Place">{places.map((c) => <option key={c}>{c}</option>)}</select>}
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={sel} aria-label="Sort"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="short">Shortest first</option></select>
          <div className="flex border border-ink/20">{[['grid', LayoutGrid], ['list', List]].map(([v, Icon]) => <button key={v} onClick={() => setView(v)} aria-label={`${v} view`} className={`w-12 h-12 md:w-10 md:h-10 flex items-center justify-center shrink-0 ${view === v ? 'bg-ink text-bone' : ''}`}><Icon size={15} /></button>)}</div>
        </div>
      </div>
      <p className="eyebrow text-stone-500 mb-6">{shown.length} {shown.length === 1 ? noun.replace(/s$/, '') : noun}</p>
      {shown.length === 0 ? (
        <div className="py-20 text-center"><p className="display text-3xl tracking-tightest mb-2">Nothing matches that.</p><button className="underline" onClick={() => { setQ(''); setCat('All'); setPlace('All'); }}>Clear filters</button></div>
      ) : view === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">{shown.map((t) => <ListingCard key={t.slug} t={t} />)}</div>
      ) : (
        <div className="space-y-8">{shown.map((t) => <ListingCard key={t.slug} t={t} variant="list" />)}</div>
      )}
    </div>
  );
}
