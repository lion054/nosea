import { notFound, redirect } from 'next/navigation';
import { getPayment } from '@/lib/payment';
import PayPanel from '@/components/PayPanel';

export const metadata = { title: 'Payment', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page({ params }) {
  const p = await getPayment(params.code);
  if (!p) notFound();
  if (p.error) return <div className="max-w-xl mx-auto px-6 py-24 text-center"><h1 className="display text-4xl tracking-tightest mb-3">We cannot take payment for this booking.</h1><p className="text-stone-600">{p.code === 'not_payable' ? p.error : 'Please WhatsApp us with your booking reference and we will sort it out.'}</p></div>;
  if (p.paid) redirect(`/booking/confirmed?code=${params.code}`);
  return <PayPanel p={p} />;
}
