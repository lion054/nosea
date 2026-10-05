import { NextResponse } from 'next/server';
import { tanova } from '@/lib/catalog';
import { CODE_RE } from '@/lib/payment';
import { limited, ipOf } from '@/lib/rateLimit';

// "I have sent the transfer": tells the business, which confirms once the money arrives.
export async function POST(req, ctx) {
  const params = await ctx.params;
  if (!CODE_RE.test(params.code)) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  if (limited(`paytr:${ipOf(req)}`, 6)) return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  if (!b.reference?.trim()) return NextResponse.json({ error: 'Please enter the reference you used.' }, { status: 400 });
  const res = await tanova(`/bookings/${params.code}/payment/transfer`, { method: 'POST', body: { reference: String(b.reference).trim().slice(0, 191), ...(b.notes ? { notes: String(b.notes).slice(0, 500) } : {}) } }).catch(() => null);
  const j = await res?.json().catch(() => null);
  if (!res?.ok) return NextResponse.json({ error: j?.error?.message || 'Could not record that. Please WhatsApp us your reference.' }, { status: res?.status === 409 || res?.status === 422 ? res.status : 502 });
  return NextResponse.json({ ok: true });
}
