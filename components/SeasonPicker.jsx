'use client';
import { useState } from 'react';

export default function SeasonPicker({ best, notes, months, short }) {
  const now = new Date().getMonth() + 1;
  const [m, setM] = useState(best.includes(now) ? now : best[0]);
  return (
    <div>
      <div className="grid grid-cols-6 md:grid-cols-12 gap-1" role="tablist" aria-label="Month">
        {short.map((s, i) => {
          const n = i + 1; const good = best.includes(n);
          return <button key={s} role="tab" aria-selected={m === n} onClick={() => setM(n)} className={`py-3 text-sm border transition ${m === n ? 'bg-ink text-bone border-ink' : good ? 'bg-sunset text-bone border-transparent' : 'border-ink/15 text-stone-500 hover:border-ink'}`}>{s}</button>;
        })}
      </div>
      <div className="mt-5 border-l-2 border-sienna pl-5"><p className="eyebrow mb-1">{months[m - 1]}</p><p className="text-stone-700 leading-relaxed">{notes[m] || (best.includes(m) ? 'A good time to visit.' : 'Possible, but not usually the best time.')}</p></div>
      <p className="text-xs text-stone-500 mt-4"><span className="inline-block w-3 h-3 bg-sunset align-middle mr-1" /> Usually the best months</p>
    </div>
  );
}
