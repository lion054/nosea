import { NextResponse } from 'next/server';
import { tanova } from '@/lib/catalog';
import { limited, ipOf } from '@/lib/rateLimit';

// Trip-planning enquiries go into Nosea's portal inbox (a concierge conversation) so the team answers from one place.
export async function POST(req) {
  if (limited(`enq:${ipOf(req)}`, 4)) return NextResponse.json({ error: 'Too many messages. Please wait a few minutes.' }, { status: 429 });
  let b;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (b.website) return NextResponse.json({ ok: true });
  if (!b.name?.trim() || !/^\S+@\S+\.\S+$/.test(b.email || '') || !b.message?.trim()) return NextResponse.json({ error: 'Please add your name, email and a few words about the trip.' }, { status: 400 });
  const lines = [b.message.trim(), '', b.when && `When: ${b.when}`, b.guests && `Travellers: ${b.guests}`, b.budget && `Budget: ${b.budget}`, b.phone && `Phone: ${b.phone}`, b.interest && `Interested in: ${b.interest}`].filter((x) => x !== false && x !== undefined && x !== null && x !== '');
  try {
    const res = await tanova('/concierge/conversations', { method: 'POST', body: { message: lines.join('\n'), channel: 'web', chatbot_name: 'Nosea website', guest_name: b.name.trim(), guest_email: b.email.trim() } });
    if (!res.ok) return NextResponse.json({ error: 'We could not send that just now. Please WhatsApp or email us.' }, { status: 502 });
  } catch { return NextResponse.json({ error: 'We could not send that just now. Please WhatsApp or email us.' }, { status: 502 }); }
  return NextResponse.json({ ok: true }, { status: 201 });
}
