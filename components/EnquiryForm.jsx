'use client';
import { useState } from 'react';
import { waLink } from '@/lib/site';

const field = 'w-full bg-transparent border-b border-ink/30 py-3 text-base focus:outline-none focus:border-sienna placeholder:text-stone-400';

export default function EnquiryForm({ interest = '', compact = false }) {
  const [state, setState] = useState({ status: 'idle', error: '' });
  async function submit(e) {
    e.preventDefault();
    setState({ status: 'sending', error: '' });
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, interest }) }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    if (r?.ok) setState({ status: 'sent', error: '' });
    else setState({ status: 'error', error: d?.error || 'Could not send. Please try WhatsApp.' });
  }
  if (state.status === 'sent') return (
    <div className="border border-ink/15 bg-paper p-8"><p className="display text-3xl tracking-tightest mb-2">Thank you — message received.</p><p className="text-stone-600">A Nosea planner will reply by email, usually within a working day. In a hurry? <a className="underline" href={waLink('Hello Nosea Safaris, I just sent an enquiry from the website.')}>WhatsApp us</a>.</p></div>
  );
  return (
    <form onSubmit={submit} className="space-y-5">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid md:grid-cols-2 gap-5"><input required name="name" placeholder="Your name" className={field} autoComplete="name" /><input required type="email" name="email" placeholder="Email" className={field} autoComplete="email" /></div>
      {!compact && <div className="grid md:grid-cols-3 gap-5"><input name="phone" placeholder="Phone / WhatsApp (optional)" className={field} autoComplete="tel" /><input name="when" placeholder="When? (e.g. July 2027)" className={field} /><input name="guests" placeholder="How many travellers?" className={field} /></div>}
      {!compact && <input name="budget" placeholder="Rough budget per person (optional)" className={field} />}
      <textarea required name="message" rows={compact ? 3 : 5} placeholder={interest ? `Tell us what you would like to know about ${interest}…` : 'Tell us the trip you have in mind: where, what you love, who is coming…'} className={`${field} resize-none`} />
      {state.status === 'error' && <p className="text-sm text-red-700" role="alert">{state.error}</p>}
      <button disabled={state.status === 'sending'} className="bg-ink text-bone px-8 py-4 eyebrow hover:bg-sienna transition disabled:opacity-50">{state.status === 'sending' ? 'Sending…' : 'Send enquiry'}</button>
    </form>
  );
}
