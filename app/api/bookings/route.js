import { NextResponse } from 'next/server';
import { getBySlug, tanova } from '@/lib/catalog';
import { limited, ipOf } from '@/lib/rateLimit';

// The browser sends choices, never a price: the portal works out the price, seats and availability itself.
// Payment happens on this site's own /pay page; card details are only ever typed on the payment gateway's page.
export async function POST(req) {
  if (limited(`book:${ipOf(req)}`, 6)) return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
  let b;
  try { b = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const adults = parseInt(b.adults, 10), children = parseInt(b.children || 0, 10);
  if (!b.slug || !/^\d{4}-\d{2}-\d{2}$/.test(b.startDate || '') || !(adults >= 1) || !b.firstName?.trim() || !b.lastName?.trim() || !/^\S+@\S+\.\S+$/.test(b.email || '')) {
    return NextResponse.json({ error: 'Please fill in your name, email, date and number of guests.' }, { status: 400 });
  }
  if (b.website) return NextResponse.json({ ok: true }, { status: 201 }); // honeypot
  const tour = await getBySlug(b.slug);
  if (!tour) return NextResponse.json({ error: 'We do not recognise that trip.' }, { status: 404 });

  const payload = {
    service_type: 'tour', service_id: tour.id, start_date: b.startDate, adults,
    first_name: b.firstName.trim(), last_name: b.lastName.trim(), email: b.email.trim(),
    ...(children ? { children } : {}), ...(b.phone ? { phone: String(b.phone).slice(0, 40) } : {}), ...(b.notes ? { notes: String(b.notes).slice(0, 1500) } : {}),
  };
  let res;
  try { res = await tanova('/bookings', { method: 'POST', body: payload }); } catch { return NextResponse.json({ error: 'Could not reach the booking system. Please try again, or WhatsApp us.' }, { status: 502 }); }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const e = data?.error || {};
    const msg = e.code === 'sold_out' ? `Sorry, only ${e.seats_left ?? 0} seats are left on that date.`
      : e.code === 'not_available' ? 'That trip is not running on the chosen date.'
      : e.code === 'validation_failed' ? (e.message || 'Please check your details.')
      : e.code === 'subscription_required' ? 'Online booking is paused. Please WhatsApp us and we will confirm your trip.'
      : 'Something went wrong creating your booking.';
    return NextResponse.json({ error: msg, code: e.code }, { status: res.status === 422 ? 422 : res.status >= 500 ? 502 : res.status });
  }
  const r = data?.data || {};
  return NextResponse.json({ code: r.booking_code, status: r.status, total: r.total }, { status: 201 });
}
