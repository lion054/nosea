import { NextResponse } from 'next/server';
import { tanova } from '@/lib/catalog';
import { CODE_RE, siteOrigin } from '@/lib/payment';
import { limited, ipOf } from '@/lib/rateLimit';

// Starts a gateway payment. The guest is sent to the gateway's own page (card details are never typed on this site) and comes back to /booking/confirmed.
export async function POST(req, ctx) {
  const params = await ctx.params;
  if (!CODE_RE.test(params.code)) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  if (limited(`payon:${ipOf(req)}`, 10)) return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  if (!/^[a-z]{3,16}$/.test(b.gateway || '')) return NextResponse.json({ error: 'Choose a payment method.' }, { status: 400 });
  const res = await tanova(`/bookings/${params.code}/payment/online`, { method: 'POST', body: { gateway: b.gateway, choice: b.choice === 'next' ? 'next' : 'balance', return_to: `${siteOrigin()}/booking/confirmed` } }).catch(() => null);
  const j = await res?.json().catch(() => null);
  if (!res?.ok || !j?.data?.url) return NextResponse.json({ error: j?.error?.message || 'We could not start the payment. Nothing was charged.' }, { status: res?.status === 422 ? 422 : 502 });
  return NextResponse.json({ url: j.data.url });
}
