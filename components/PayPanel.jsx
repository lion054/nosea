'use client';
import { useState } from 'react';
import { Lock, Landmark, CreditCard, Check, Copy } from 'lucide-react';
import { waLink } from '@/lib/site';

const field = 'w-full bg-transparent border-b border-ink/30 py-3 text-base focus:outline-none focus:border-sienna placeholder:text-stone-400';
const money = (n, c = 'USD') => `${c === 'USD' ? '$' : `${c} `}${Number(n).toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(+n) ? 0 : 2 })}`;

export default function PayPanel({ p }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const online = p.methods.online; const bank = p.methods.bank;
  const none = !online.length && !bank;
  const pretty = p.service?.start_date ? new Date(p.service.start_date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : null;

  async function payOnline(gateway) {
    setBusy(gateway); setError('');
    const r = await fetch(`/api/pay/${p.code}/online`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gateway }) }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    if (r?.ok && d.url) { window.location.href = d.url; return; }
    setError(d?.error || 'We could not start the payment. Nothing was charged.'); setBusy('');
  }
  async function reportTransfer(e) {
    e.preventDefault(); setBusy('transfer'); setError('');
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch(`/api/pay/${p.code}/transfer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    if (r?.ok) setSent(true); else setError(d?.error || 'Could not record that. Please WhatsApp us your reference.');
    setBusy('');
  }
  const copy = (t) => { navigator.clipboard?.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  if (sent) return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <Check size={44} strokeWidth={1.3} className="text-sienna mx-auto mb-6" />
      <h1 className="display text-5xl tracking-tightest mb-4">Thank you.</h1>
      <p className="text-stone-600 leading-relaxed mb-2">We have your transfer details. Your booking <strong>{p.invoice_number}</strong> is confirmed as soon as the money reaches our account, and we will email you.</p>
      <p className="text-stone-600">Questions? <a className="underline" href={waLink(`Hello Nosea Safaris, I sent a transfer for ${p.invoice_number}.`)}>WhatsApp us</a>.</p>
    </div>
  );

  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-10 pt-14 pb-8 grid md:grid-cols-12 gap-12">
      <div className="md:col-span-7 space-y-8">
        <div><p className="eyebrow mb-3">Step 2 of 2 · Payment</p><h1 className="display text-5xl tracking-tightest leading-none">Pay for your trip.</h1><p className="text-stone-600 mt-3">Your seats are held while you pay. Reference <strong>{p.invoice_number}</strong>.</p></div>

        {online.length > 0 && (
          <section className="border border-ink/15 p-6">
            <p className="eyebrow mb-4 flex items-center gap-2"><CreditCard size={14} /> Pay online</p>
            <div className="space-y-3">
              {online.map((m) => <button key={m.id} onClick={() => payOnline(m.id)} disabled={!!busy} className="w-full bg-ink text-bone py-4 px-5 flex items-center justify-between hover:bg-sienna transition disabled:opacity-50"><span className="eyebrow">{m.label}</span><span className="flex items-center gap-2 text-sm">{busy === m.id ? 'Opening…' : money(p.amount_due, p.currency)} <Lock size={13} /></span></button>)}
            </div>
            <p className="text-xs text-stone-500 mt-3">You will enter your payment details on the payment provider's own secure page, then come straight back here.</p>
          </section>
        )}

        {bank && (
          <section className="border border-ink/15 p-6">
            <p className="eyebrow mb-4 flex items-center gap-2"><Landmark size={14} /> Bank transfer</p>
            {bank.details ? <pre className="whitespace-pre-wrap font-sans text-sm bg-paper border border-ink/10 p-4 mb-4">{bank.details}</pre> : <p className="text-sm bg-paper border border-ink/10 p-4 mb-4">Our bank details will be emailed to you with your booking reference. You can also <a className="underline" href={waLink(`Hello Nosea Safaris, please send bank details for ${p.invoice_number}.`)}>ask on WhatsApp</a>.</p>}
            <p className="text-sm mb-1">Amount: <strong>{money(p.amount_due, p.currency)}</strong>. Use this reference:</p>
            <button onClick={() => copy(bank.reference)} className="inline-flex items-center gap-2 border border-ink/25 px-3 py-2 text-sm mb-6 hover:bg-ink hover:text-bone transition"><strong>{bank.reference}</strong> {copied ? <Check size={14} /> : <Copy size={14} />}</button>
            <form onSubmit={reportTransfer} className="space-y-4 border-t border-ink/10 pt-5">
              <p className="text-sm text-stone-600">Sent it? Tell us so we can match it.</p>
              <input required name="reference" defaultValue={bank.reference} placeholder="Reference you used" className={field} />
              <input name="notes" placeholder="Anything to add (optional)" className={field} />
              <button disabled={!!busy} className="bg-ink text-bone px-6 py-3 eyebrow hover:bg-sienna transition disabled:opacity-50">{busy === 'transfer' ? 'Sending…' : 'I have sent the transfer'}</button>
            </form>
          </section>
        )}

        {none && <section className="border border-ink/15 p-6"><p className="display text-2xl tracking-tightest mb-2">Your seats are reserved.</p><p className="text-stone-600 text-sm">Online payment is not switched on yet. Message us with reference <strong>{p.invoice_number}</strong> and we will send payment details straight away.</p><a href={waLink(`Hello Nosea Safaris, I reserved ${p.service?.title || 'a trip'} (${p.invoice_number}) and would like to pay.`)} className="inline-block mt-4 bg-ink text-bone px-6 py-3 eyebrow hover:bg-sienna transition">WhatsApp us</a></section>}

        {error && <p className="text-sm text-red-700 border border-red-200 bg-red-50 p-3" role="alert">{error}</p>}
      </div>

      <aside className="md:col-span-5">
        <div className="border border-ink/15 bg-paper sticky top-28 p-6">
          <p className="eyebrow text-stone-500 mb-1">Your booking</p>
          <h2 className="display text-3xl tracking-tightest leading-tight mb-4">{p.service?.title || 'Your trip'}</h2>
          <dl className="text-sm space-y-2 border-t border-ink/10 pt-4">
            {pretty && <div className="flex justify-between gap-4"><dt className="text-stone-500">Date</dt><dd className="text-right">{pretty}</dd></div>}
            {p.service?.guests > 0 && <div className="flex justify-between"><dt className="text-stone-500">Guests</dt><dd>{p.service.guests}</dd></div>}
            <div className="flex justify-between"><dt className="text-stone-500">Total</dt><dd>{money(p.total, p.currency)}</dd></div>
            {p.amount_paid > 0 && <div className="flex justify-between"><dt className="text-stone-500">Paid so far</dt><dd>{money(p.amount_paid, p.currency)}</dd></div>}
          </dl>
          <div className="flex items-end justify-between border-t border-ink/10 mt-4 pt-4"><span className="eyebrow text-stone-500">Due now</span><span className="display text-4xl tracking-tightest">{money(p.amount_due, p.currency)}</span></div>
        </div>
      </aside>
    </div>
  );
}
