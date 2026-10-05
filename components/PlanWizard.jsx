'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Heart, Users, User, UsersRound, PartyPopper, Loader2, MessageCircle, RotateCcw, Send } from 'lucide-react';
import Img from './Img';
import { waLink } from '@/lib/site';

const WHO = [['couple', 'A couple', Heart], ['family', 'Family with kids', Users], ['friends', 'Friends', UsersRound], ['solo', 'Just me', User], ['group', 'A bigger group', PartyPopper]];
const INTERESTS = [['wildlife', 'Wildlife', 'Game drives, sanctuaries, birds'], ['adventure', 'Adventure', 'Dunes, rapids, big views'], ['culture', 'Culture & history', 'Ruins, heritage, people'], ['nature', 'Walks & landscapes', 'Hikes, mountains, big skies'], ['water', 'On the water', 'Cruises, river, the Falls'], ['relaxed', 'Easy and relaxed', 'Slow days, good food']];
const BUDGET = [['low', 'Keep it light', 'Under about $400 each'], ['mid', 'Comfortable', 'About $400–$1,500 each'], ['high', 'Go big', 'About $1,500–$4,000 each'], ['any', 'Show me everything', 'Budget is flexible']];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STEPS = ['who', 'where', 'interests', 'days', 'when', 'budget'];

const Card = ({ on, onClick, children, className = '' }) => <button type="button" onClick={onClick} aria-pressed={on} className={`text-left border p-5 transition ${on ? 'bg-ink text-bone border-ink' : 'border-ink/20 hover:border-ink'} ${className}`}>{children}</button>;

function SendPlan({ data, answers }) {
  const [s, setS] = useState({ busy: false, sent: false, error: '' });
  async function submit(e) {
    e.preventDefault(); setS({ busy: true, sent: false, error: '' });
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const p = data.plan;
    const brief = [`Plan from the website trip planner`, `Who: ${answers.who}, ${answers.travellers} traveller(s)`, `Interests: ${answers.interests.join(', ') || 'open'}`, `Days: ${answers.days}`, `Month: ${answers.month || 'flexible'}`, `Budget: ${answers.budget}`, '', `Suggested: ${p.items.map((i) => `${i.title} (${i.url})`).join(' + ')}`, `Indicative total: $${p.perPerson} per person, $${p.party} for the party`, f.notes ? `\nNotes: ${f.notes}` : ''].join('\n');
    const r = await fetch('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: f.name, email: f.email, phone: f.phone, guests: String(answers.travellers), when: answers.month ? MONTHS[answers.month - 1] : '', message: brief, interest: 'Trip planner' }) }).catch(() => null);
    setS(r?.ok ? { busy: false, sent: true, error: '' } : { busy: false, sent: false, error: 'Could not send. Please WhatsApp us instead.' });
  }
  if (s.sent) return <div className="border border-ink/15 bg-paper p-6"><Check className="text-sienna mb-2" /><p className="display text-2xl tracking-tightest mb-1">Sent to our planners.</p><p className="text-stone-600 text-sm">They will reply by email with a proper quote, usually within a working day.</p></div>;
  const f = 'w-full bg-transparent border-b border-ink/30 py-3 focus:outline-none focus:border-sienna';
  return (
    <form onSubmit={submit} className="border border-ink/15 bg-paper p-6 space-y-4">
      <p className="display text-2xl tracking-tightest">Get this planned and quoted</p>
      <p className="text-sm text-stone-600">Send this plan to a Nosea planner. They will confirm availability, adjust it with you and send a firm price.</p>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid sm:grid-cols-2 gap-4"><input required name="name" placeholder="Your name" className={f} autoComplete="name" /><input required type="email" name="email" placeholder="Email" className={f} autoComplete="email" /></div>
      <input name="phone" placeholder="WhatsApp (optional)" className={f} autoComplete="tel" />
      <textarea name="notes" rows={2} placeholder="Anything to add? Dates, celebrations, must-dos…" className={`${f} resize-none`} />
      {s.error && <p className="text-sm text-red-700" role="alert">{s.error}</p>}
      <button disabled={s.busy} className="bg-ink text-bone px-8 py-4 eyebrow hover:bg-sienna transition disabled:opacity-50 flex items-center gap-2"><Send size={14} /> {s.busy ? 'Sending…' : 'Send my plan'}</button>
    </form>
  );
}

function Result({ data, onRestart }) {
  const { plan, alternatives, seasons, answers } = data;
  const money = (n) => `$${Number(n).toLocaleString('en-US')}`;
  const hero = plan.items[0];
  return (
    <div>
      <div className="flex items-center justify-between mb-8"><p className="eyebrow">Your plan</p><button onClick={onRestart} className="eyebrow flex items-center gap-2 hover:text-sienna"><RotateCcw size={13} /> Start over</button></div>
      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <div className="relative aspect-16/10 overflow-hidden bg-stone-100 mb-6"><Img src={hero.photo} alt={hero.title} sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />{hero.stock && <span className="absolute bottom-3 left-3 eyebrow bg-ink/70 text-bone px-2.5 py-1">Illustrative photo</span>}</div>
          <h2 className="display text-4xl md:text-6xl tracking-tightest leading-none mb-3">{plan.title}</h2>
          <p className="text-stone-600 mb-6">{plan.type === 'journey' ? `${plan.days}-day journey` : `${plan.days} ${plan.days === 1 ? 'day' : 'days'}`} · {answers.travellers} {answers.travellers === 1 ? 'traveller' : 'travellers'}</p>
          <ol className="space-y-4">
            {plan.items.map((i, k) => (
              <li key={i.slug} className="border border-ink/15 p-5">
                <div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-sienna-dark mb-1">{i.day ? `Day ${i.day}` : `${i.days} days`} · {i.place}</p><Link href={i.url} className="display text-2xl tracking-tightest hover:text-sienna">{i.title}</Link></div><p className="display text-2xl tracking-tightest shrink-0">{money(i.price)}</p></div>
                <p className="text-sm text-stone-600 mt-2">{i.tagline}</p><p className="text-xs text-stone-500 mt-2">{i.why}.</p>
              </li>
            ))}
          </ol>
          {plan.addOns?.length > 0 && <div className="mt-6"><p className="eyebrow mb-3">Optional extras</p><div className="space-y-3">{plan.addOns.map((i) => <Link key={i.slug} href={i.url} className="flex items-center justify-between border border-dashed border-ink/30 p-4 hover:border-ink"><span><span className="eyebrow text-stone-500 block">{i.place}</span>{i.title}</span><span>{money(i.price)}</span></Link>)}</div></div>}
          {plan.note && <p className="text-sm text-stone-600 mt-5 border-l-2 border-sienna pl-4">{plan.note}</p>}
        </div>
        <aside className="lg:col-span-5 space-y-6">
          <div className="border border-ink bg-paper p-6">
            <p className="eyebrow text-stone-500">Indicative total</p>
            <p className="display text-5xl tracking-tightest mb-1">{money(plan.party)}</p>
            <p className="text-sm text-stone-600 mb-5">{money(plan.perPerson)} per person × {answers.travellers}. Your firm price depends on dates and party, and is shown at checkout.</p>
            <Link href={hero.url} className="block text-center bg-ink text-bone px-6 py-4 eyebrow hover:bg-sienna transition">{plan.type === 'journey' ? 'Choose dates and book' : 'See it and pick a date'}</Link>
          </div>
          {seasons.length > 0 && <div className="border border-ink/15 p-5"><p className="eyebrow mb-3">In {MONTHS[answers.month - 1]}</p><ul className="space-y-2 text-sm">{seasons.map((s) => <li key={s.slug}><Link href={`/destinations/${s.slug}`} className="font-medium hover:text-sienna">{s.name}</Link> <span className={s.good ? 'text-miombo' : 'text-stone-500'}>{s.good ? '· good time' : '· not the usual best'}</span>{s.note && <span className="block text-stone-600">{s.note}</span>}</li>)}</ul></div>}
          <SendPlan data={data} answers={answers} />
          <div className="flex flex-wrap gap-3"><button onClick={() => window.dispatchEvent(new Event('nosea:chat'))} className="flex items-center gap-2 border border-ink/20 px-4 py-3 text-sm hover:bg-ink hover:text-bone transition"><MessageCircle size={15} /> Ask the concierge</button><a href={waLink(`Hello Nosea Safaris, I used the trip planner: ${plan.title}.`)} className="flex items-center gap-2 border border-ink/20 px-4 py-3 text-sm hover:bg-ink hover:text-bone transition">WhatsApp us</a></div>
        </aside>
      </div>
      {alternatives.length > 0 && <div className="mt-16"><p className="eyebrow mb-4">Other ideas</p><div className="grid sm:grid-cols-3 gap-5">{alternatives.map((i) => <Link key={i.slug} href={i.url} className="group block"><div className="relative aspect-4/3 overflow-hidden bg-stone-100 mb-3"><Img src={i.photo} alt={i.title} sizes="(min-width: 640px) 30vw, 100vw" className="card-img object-cover" /></div><p className="eyebrow text-stone-500">{i.duration} · from {money(i.price)}</p><p className="display text-xl tracking-tightest">{i.title}</p></Link>)}</div></div>}
    </div>
  );
}

export default function PlanWizard({ dest, destinations = [], interestPhotos = {} }) {
  const router = useRouter(); const sp = useSearchParams();
  const [a, setA] = useState({ who: 'couple', travellers: 2, interests: [], days: 3, month: null, budget: 'any', dest: dest || null });
  const [step, setStep] = useState(0);
  const [data, setData] = useState(null); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const top = useRef(null);

  async function run(ans) {
    setLoading(true); setError('');
    try {
      const r = await fetch('/api/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ans) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'failed');
      setData(d);
      const q = new URLSearchParams({ w: ans.who, n: String(ans.travellers), i: ans.interests.join(','), d: String(ans.days), b: ans.budget, ...(ans.month ? { m: String(ans.month) } : {}), ...(ans.dest ? { dest: ans.dest } : {}) });
      router.replace(`/plan?${q}`, { scroll: false });
    } catch (e) { setError('We could not build your plan just now. Please try again, or message us.'); } finally { setLoading(false); }
  }
  // A shared link (or refresh) goes straight to the plan.
  useEffect(() => {
    if (sp.get('w') && sp.get('d')) { const ans = { who: sp.get('w'), travellers: +sp.get('n') || 2, interests: (sp.get('i') || '').split(',').filter(Boolean), days: +sp.get('d'), month: sp.get('m') ? +sp.get('m') : null, budget: sp.get('b') || 'any', dest: sp.get('dest') || null }; setA(ans); run(ans); }
    // eslint-disable-next-line
  }, []);

  // A live "best match so far" beside the questions, refreshed as the answers change.
  useEffect(() => {
    if (data) return;
    const t = setTimeout(async () => {
      try { const r = await fetch('/api/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(a) }); if (r.ok) setPreview(await r.json()); } catch {}
    }, 350);
    return () => clearTimeout(t);
  }, [a, data]);

  const set = (k, v) => setA((x) => ({ ...x, [k]: v }));
  const toggle = (id) => set('interests', a.interests.includes(id) ? a.interests.filter((x) => x !== id) : [...a.interests, id].slice(0, 4));
  const next = () => { if (step === STEPS.length - 1) run(a); else { setStep(step + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  const restart = () => { setData(null); setStep(0); setPreview(null); router.replace('/plan', { scroll: false }); };

  if (loading) return <div className="py-32 text-center"><Loader2 className="animate-spin mx-auto mb-4 text-sienna" /><p className="display text-3xl tracking-tightest">Building your plan…</p></div>;
  if (data) return <Result data={data} onRestart={restart} />;

  const q = STEPS[step];
  const pv = preview?.plan; const pvItem = pv?.items?.[0];
  const money = (n) => `$${Number(n).toLocaleString('en-US')}`;
  const placeName = destinations.find((d) => d.slug === a.dest)?.name;
  return (
    <div ref={top} className="grid lg:grid-cols-12 gap-10 lg:gap-16 pb-28">
      <div className="lg:col-span-7">
        <div className="flex items-center justify-between mb-3"><p className="eyebrow">Step {step + 1} of {STEPS.length}</p><p className="eyebrow text-stone-500">{['Who', 'Where', 'Love', 'Days', 'When', 'Budget'][step]}</p></div>
        <div className="flex gap-1 mb-10" aria-hidden="true">{STEPS.map((s, i) => <button key={s} type="button" onClick={() => i < step && setStep(i)} className={`h-1.5 flex-1 ${i <= step ? 'bg-sunset' : 'bg-stone-200'} ${i < step ? 'cursor-pointer' : 'cursor-default'}`} tabIndex={-1} />)}</div>

        {q === 'who' && <><h2 className="display text-4xl md:text-6xl tracking-tightest mb-8">Who is <em className="text-sienna" style={{ fontStyle: 'italic' }}>travelling?</em></h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-8">{WHO.map(([id, label, Icon]) => <Card key={id} on={a.who === id} onClick={() => set('who', id)}><Icon size={22} strokeWidth={1.4} className="mb-3" />{label}</Card>)}</div>
          <div className="flex items-center gap-4"><span className="eyebrow">How many people?</span><div className="flex items-center gap-3"><button type="button" onClick={() => set('travellers', Math.max(1, a.travellers - 1))} className="w-10 h-10 border border-ink/25 hover:bg-ink hover:text-bone" aria-label="Fewer">−</button><span className="display text-3xl w-10 text-center">{a.travellers}</span><button type="button" onClick={() => set('travellers', Math.min(40, a.travellers + 1))} className="w-10 h-10 border border-ink/25 hover:bg-ink hover:text-bone" aria-label="More">+</button></div></div></>}

        {q === 'where' && <><h2 className="display text-4xl md:text-6xl tracking-tightest mb-3">Any place in <em className="text-sienna" style={{ fontStyle: 'italic' }}>mind?</em></h2><p className="text-stone-600 mb-8">Optional. Pick one, or let us choose.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button type="button" onClick={() => set('dest', null)} aria-pressed={!a.dest} className={`aspect-4/3 border p-4 text-left flex flex-col justify-end transition ${!a.dest ? 'bg-ink text-bone border-ink' : 'border-ink/20 hover:border-ink'}`}><span className="eyebrow mb-1 opacity-70">Open</span><span className="display text-2xl tracking-tightest">Surprise me</span></button>
            {destinations.map((d) => (
              <button key={d.slug} type="button" onClick={() => set('dest', d.slug)} aria-pressed={a.dest === d.slug} className={`relative aspect-4/3 overflow-hidden text-left text-bone ${a.dest === d.slug ? 'ring-2 ring-sienna ring-offset-2' : ''}`}>
                <Img src={d.photo} alt="" sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" /><div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4"><span className="eyebrow text-bone/70 block mb-1">{d.count} {d.count === 1 ? 'trip' : 'trips'}</span><span className="display text-2xl tracking-tightest leading-none">{d.name}</span></div>
                {a.dest === d.slug && <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-sunset flex items-center justify-center"><Check size={14} /></span>}
              </button>
            ))}
          </div></>}

        {q === 'interests' && <><h2 className="display text-4xl md:text-6xl tracking-tightest mb-3">What do you <em className="text-sienna" style={{ fontStyle: 'italic' }}>love?</em></h2><p className="text-stone-600 mb-8">Pick up to four.</p>
          <div className="grid grid-cols-2 gap-3">{INTERESTS.map(([id, label, blurb]) => { const on = a.interests.includes(id); return (
            <button key={id} type="button" onClick={() => toggle(id)} aria-pressed={on} className={`relative aspect-4/3 overflow-hidden text-left text-bone ${on ? 'ring-2 ring-sienna ring-offset-2' : ''}`}>
              {interestPhotos[id] && <Img src={interestPhotos[id]} alt="" sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />}<div className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/30 to-ink/10" />
              <div className="absolute inset-x-0 bottom-0 p-4"><p className="display text-2xl tracking-tightest leading-none">{label}</p><p className="text-xs text-bone/75 mt-1">{blurb}</p></div>
              {on && <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-sunset flex items-center justify-center"><Check size={14} /></span>}
            </button>); })}</div></>}

        {q === 'days' && <><h2 className="display text-4xl md:text-6xl tracking-tightest mb-8">How many <em className="text-sienna" style={{ fontStyle: 'italic' }}>days?</em></h2>
          <p className="display text-8xl tracking-tightest mb-4">{a.days}<span className="eyebrow ml-3 text-stone-500">{a.days === 1 ? 'day' : 'days'}</span></p>
          <input type="range" min={1} max={14} value={a.days} onChange={(e) => set('days', +e.target.value)} className="w-full accent-[#F46F30]" aria-label="Number of days" />
          <div className="flex justify-between eyebrow text-stone-500 mt-2"><span>A day trip</span><span>Two weeks</span></div></>}

        {q === 'when' && <><h2 className="display text-4xl md:text-6xl tracking-tightest mb-3">When are you <em className="text-sienna" style={{ fontStyle: 'italic' }}>thinking?</em></h2><p className="text-stone-600 mb-8">We will tell you how each place is that month.</p>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-4">{MONTHS.map((m, i) => <Card key={m} on={a.month === i + 1} onClick={() => set('month', i + 1)} className="!p-4 text-center">{m}</Card>)}</div>
          <button type="button" onClick={() => set('month', null)} className={`text-sm underline ${a.month === null ? 'text-sienna-dark' : ''}`}>I am flexible</button></>}

        {q === 'budget' && <><h2 className="display text-4xl md:text-6xl tracking-tightest mb-3">What feels <em className="text-sienna" style={{ fontStyle: 'italic' }}>right?</em></h2><p className="text-stone-600 mb-8">Per person, for the whole trip. It only helps us rank; nothing is locked in.</p>
          <div className="grid sm:grid-cols-2 gap-3">{BUDGET.map(([id, label, blurb]) => <Card key={id} on={a.budget === id} onClick={() => set('budget', id)}><p className="display text-2xl tracking-tightest">{label}</p><p className={`text-sm mt-1 ${a.budget === id ? 'text-bone/70' : 'text-stone-500'}`}>{blurb}</p></Card>)}</div></>}

        {error && <p className="text-sm text-red-700 mt-6" role="alert">{error}</p>}
      </div>

      <aside className="lg:col-span-5 hidden lg:block">
        <div className="sticky top-28 border border-ink/15 bg-paper">
          <p className="eyebrow px-5 pt-5 text-stone-500">Best match so far</p>
          {pvItem ? (
            <div className="p-5 pt-3">
              <div className="relative aspect-4/3 overflow-hidden bg-stone-100 mb-4"><Img src={pvItem.photo} alt={pvItem.title} sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" /></div>
              <p className="eyebrow text-sienna-dark mb-1">{pv.type === 'journey' ? `${pv.days}-day journey` : `${pv.days} ${pv.days === 1 ? 'day' : 'days'}`}{placeName ? ` · ${placeName}` : ''}</p>
              <p className="display text-3xl tracking-tightest leading-tight mb-2">{pv.title}</p>
              <p className="text-sm text-stone-600">{pvItem.why}.</p>
              <div className="flex items-end justify-between mt-4 pt-4 border-t border-ink/10"><span className="eyebrow text-stone-500">About {money(pv.perPerson)} per person</span><span className="display text-2xl tracking-tightest">{money(pv.party)}<span className="eyebrow text-stone-500 ml-1">for {a.travellers}</span></span></div>
            </div>
          ) : <p className="p-5 text-sm text-stone-500">Answer a question and a first idea appears here.</p>}
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-30 bg-bone/95 backdrop-blur border-t border-ink/10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="eyebrow flex items-center gap-2 disabled:opacity-30"><ArrowLeft size={14} /> Back</button>
          <div className="flex items-center gap-3"><button type="button" onClick={next} className="bg-ink text-bone px-8 py-4 eyebrow hover:bg-sienna transition flex items-center gap-2">{step === STEPS.length - 1 ? 'Build my plan' : 'Next'} <ArrowRight size={14} /></button></div>
        </div>
      </div>
    </div>
  );
}
