import Link from 'next/link';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { waLink } from '@/lib/site';
import { getPayment } from '@/lib/payment';

export const metadata = { title: 'Your booking', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page(props) {
  const searchParams = await props.searchParams;
  const code = (searchParams?.code || '').toString();
  const back = (searchParams?.status || '').toString();   // what the payment provider said on the way back
  const p = code ? await getPayment(code) : null;
  const ref = p && !p.error ? p.invoice_number : null;
  const paid = p && !p.error && p.paid;
  const failed = !paid && (back === 'failed' || back === 'cancelled');
  const Icon = paid ? CheckCircle2 : failed ? XCircle : Clock;
  const title = paid ? 'Thank you, you are booked.' : failed ? (back === 'cancelled' ? 'Payment cancelled.' : 'That payment did not go through.') : 'We are confirming your payment.';
  const body = paid ? 'Your payment has been received. A confirmation is on its way to your email.' : failed ? 'You have not been charged. Your seats are held for a short while, so you can try again.' : 'This can take a minute. We will email you as soon as it is confirmed. If you paid by bank transfer, it is confirmed once the money arrives.';
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <Icon size={44} strokeWidth={1.3} className={`${failed ? 'text-red-700' : 'text-sienna'} mx-auto mb-6`} />
      <h1 className="display text-5xl tracking-tightest mb-4">{title}</h1>
      {p && !p.error && p.service?.title && <p className="text-lg mb-2"><strong>{p.service.title}</strong>{p.service.start_date ? ` · ${new Date(p.service.start_date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}</p>}
      <p className="text-stone-600 leading-relaxed mb-2">{body}{ref ? <> Reference <strong>{ref}</strong>.</> : ''}</p>
      <p className="text-stone-600 mb-8">Questions? <a className="underline" href={waLink(`Hello Nosea Safaris, about my booking ${ref || ''}`)}>WhatsApp us</a>.</p>
      <div className="flex justify-center gap-3">
        {!paid && code && p && !p.error && <Link href={`/pay/${code}`} className="inline-block bg-ink text-bone px-8 py-4 eyebrow hover:bg-sienna transition">{failed ? 'Try again' : 'Back to payment'}</Link>}
        <Link href="/" className="inline-block border border-ink/25 px-8 py-4 eyebrow hover:bg-ink hover:text-bone transition">Back to the site</Link>
      </div>
    </div>
  );
}
