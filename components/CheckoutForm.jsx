'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import Img from './Img';
import { waLink } from '@/lib/site';

const field = 'w-full bg-transparent border-b border-ink/30 py-3 text-base focus:outline-none focus:border-sienna placeholder:text-stone-400';

export default function CheckoutForm({ trip, date, adults, children }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const guests = adults + children;
  const pretty = new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, slug: trip.slug, startDate: date, adults, children }) }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    if (r?.ok && d.code) { window.location.href = `/pay/${d.code}`; return; }
    setError(d?.error || 'Could not complete your booking. Please try again or WhatsApp us.');
    setBusy(false);
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-10 pt-14 pb-8 grid md:grid-cols-12 gap-12">
      <form onSubmit={submit} className="md:col-span-7 space-y-6">
        <div><p className="eyebrow mb-3">Your details</p><h1 className="display text-5xl tracking-tightest leading-none">Almost there.</h1></div>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <div className="grid sm:grid-cols-2 gap-5"><input required name="firstName" placeholder="First name" className={field} autoComplete="given-name" /><input required name="lastName" placeholder="Last name" className={field} autoComplete="family-name" /></div>
        <div className="grid sm:grid-cols-2 gap-5"><input required type="email" name="email" placeholder="Email" className={field} autoComplete="email" /><input name="phone" placeholder="Phone / WhatsApp" className={field} autoComplete="tel" /></div>
        <textarea name="notes" rows={3} placeholder="Anything we should know? Dietary needs, mobility, celebrations…" className={`${field} resize-none`} />
        {error && <p className="text-sm text-red-700 border border-red-200 bg-red-50 p-3" role="alert">{error} <a className="underline" href={waLink(`Hello Nosea Safaris, I tried to book ${trip.title} for ${date}.`)}>WhatsApp us</a></p>}
        <button disabled={busy} className="w-full bg-ink text-bone py-5 eyebrow hover:bg-sienna transition disabled:opacity-50 flex items-center justify-center gap-2"><Lock size={14} /> {busy ? 'Reserving your seats…' : 'Continue to payment'}</button>
        <p className="text-xs text-stone-500">Your seats are held while you pay on the next step. We never see or store your card details.</p>
      </form>
      <aside className="md:col-span-5">
        <div className="border border-ink/15 bg-paper sticky top-28">
          <div className="relative aspect-[16/9] overflow-hidden"><Img src={trip.photo} alt="" sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" /></div>
          <div className="p-6">
            <p className="eyebrow text-stone-500 mb-1">{trip.place} · {trip.duration}</p>
            <h2 className="display text-3xl tracking-tightest leading-tight mb-4">{trip.title}</h2>
            <dl className="text-sm space-y-2 border-t border-ink/10 pt-4">
              <div className="flex justify-between"><dt className="text-stone-500">Date</dt><dd>{pretty}</dd></div>
              <div className="flex justify-between"><dt className="text-stone-500">Guests</dt><dd>{adults} adult{adults > 1 ? 's' : ''}{children ? `, ${children} child${children > 1 ? 'ren' : ''}` : ''}</dd></div>
              <div className="flex justify-between"><dt className="text-stone-500">From</dt><dd>{guests} × ${trip.price.toLocaleString()}</dd></div>
            </dl>
            <p className="text-xs text-stone-500 mt-4">The exact total is calculated for your date and party and shown on the payment page.</p>
            <Link href={`/${trip.journey ? 'journeys' : 'experiences'}/${trip.slug}`} className="text-xs underline mt-3 inline-block">Change date or guests</Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
