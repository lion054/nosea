'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { waLink } from '@/lib/site';

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function BookingPanel({ slug, title, price, minPeople = 1, maxPeople = 20, journey }) {
  const router = useRouter();
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [days, setDays] = useState({});
  const [mode, setMode] = useState('any_day');
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState('');
  const [adults, setAdults] = useState(Math.max(2, minPeople));
  const [children, setChildren] = useState(0);

  useEffect(() => {
    let live = true;
    const from = new Date(month); const to = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const start = from < today ? today : from;
    if (to < today) return;
    setLoading(true);
    fetch(`/api/availability?slug=${slug}&from=${iso(start)}&to=${iso(to)}`)
      .then((r) => r.json())
      .then((d) => { if (!live) return; setMode(d.mode || 'any_day'); setDays((prev) => ({ ...prev, ...Object.fromEntries((d.days || []).map((x) => [x.date, x])) })); })
      .catch(() => {})
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [month, slug, today]);

  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const lead = (first.getDay() + 6) % 7; // Monday first
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  const canPrev = month > new Date(today.getFullYear(), today.getMonth(), 1);

  const chosen = days[date];
  const unit = chosen?.price ?? price;
  const guests = adults + children;
  const estimate = unit * guests;
  const left = chosen?.seats_left;
  const tooMany = left != null && guests > left;

  const go = () => router.push(`/checkout?slug=${slug}&date=${date}&adults=${adults}&children=${children}`);
  const Counter = ({ label, sub, value, set, min }) => (
    <div className="flex items-center justify-between py-3">
      <div><p className="text-sm">{label}</p><p className="text-xs text-stone-500">{sub}</p></div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => set(Math.max(min, value - 1))} className="w-11 h-11 rounded-full border border-ink/25 flex items-center justify-center hover:bg-ink hover:text-bone active:bg-ink active:text-bone transition disabled:opacity-30" disabled={value <= min} aria-label={`Fewer ${label}`}><Minus size={14} /></button>
        <span className="w-5 text-center tabular-nums">{value}</span>
        <button type="button" onClick={() => set(Math.min(maxPeople, value + 1))} className="w-11 h-11 rounded-full border border-ink/25 flex items-center justify-center hover:bg-ink hover:text-bone active:bg-ink active:text-bone transition" aria-label={`More ${label}`}><Plus size={14} /></button>
      </div>
    </div>
  );

  return (
    <div className="bg-paper border border-ink/15 p-6 md:p-7 shadow-[0_20px_60px_-25px_rgba(26,26,26,0.25)]">
      <p className="eyebrow text-stone-500">From</p>
      <p className="display text-5xl tracking-tightest mb-1">${price.toLocaleString()}<span className="eyebrow text-stone-500 ml-2 align-middle">per person</span></p>

      <div className="mt-6 border-t border-ink/10 pt-5">
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={() => canPrev && setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} disabled={!canPrev} className="w-11 h-11 flex items-center justify-center disabled:opacity-25" aria-label="Previous month"><ChevronLeft size={18} /></button>
          <p className="eyebrow">{MONTHS[month.getMonth()]} {month.getFullYear()}{loading ? ' …' : ''}</p>
          <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="w-11 h-11 flex items-center justify-center" aria-label="Next month"><ChevronRight size={18} /></button>
        </div>
        <div className="grid grid-cols-7 text-center eyebrow text-stone-500 mb-1">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} className="py-1">{d}</span>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <span key={i} />;
            const k = iso(d); const x = days[k];
            const past = d < today;
            const listed = mode === 'listed_days';
            const open = !past && (x ? x.status !== 'closed' && x.status !== 'full' : !listed && !loading);
            const sel = date === k;
            return (
              <button key={i} type="button" disabled={!open} onClick={() => setDate(k)}
                className={`h-11 text-sm flex flex-col items-center justify-center transition ${sel ? 'bg-ink text-bone' : open ? 'hover:bg-sienna hover:text-bone border border-ink/10' : 'text-stone-300 line-through'}`}
                aria-label={`${k}${x?.status === 'full' ? ' (full)' : ''}`}>
                <span>{d.getDate()}</span>
                {open && x?.price != null && <span className={`text-[9px] leading-none ${sel ? 'text-bone/70' : 'text-stone-500'}`}>${x.price}</span>}
              </button>
            );
          })}
        </div>
        {mode === 'listed_days' && <p className="text-xs text-stone-500 mt-2">Only the dates shown can be booked.</p>}
      </div>

      <div className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
        <Counter label="Adults" sub="Age 13+" value={adults} set={setAdults} min={Math.max(1, minPeople - children)} />
        <Counter label="Children" sub="Age 3–12" value={children} set={setChildren} min={0} />
      </div>

      {date && (
        <div className="mt-4 text-sm">
          <div className="flex justify-between"><span>{guests} × ${unit.toLocaleString()}</span><span className="display text-2xl tracking-tightest">${estimate.toLocaleString()}</span></div>
          {chosen?.price != null && chosen.price !== price && <p className="text-xs text-stone-500 mt-1">Today's seat price. It steps up as the trip fills; your exact total is confirmed at checkout.</p>}
          {left != null && left <= 6 && <p className="text-xs text-accent-strong mt-1">Only {left} {left === 1 ? 'seat' : 'seats'} left on this date.</p>}
          {tooMany && <p className="text-xs text-red-700 mt-1">That is more than the seats left on this date.</p>}
        </div>
      )}

      <button type="button" onClick={go} disabled={!date || tooMany} className="mt-5 w-full bg-ink text-bone py-4 eyebrow hover:bg-sienna transition disabled:opacity-40 disabled:hover:bg-ink">
        {date ? (journey ? 'Reserve this journey' : 'Book this experience') : 'Choose a date'}
      </button>
      <p className="text-xs text-stone-500 mt-3 text-center">You pay securely on the next step. Free to ask first — <a className="underline" href={waLink(`Hello Nosea Safaris, I have a question about ${title}.`)}>WhatsApp us</a>.</p>
    </div>
  );
}
