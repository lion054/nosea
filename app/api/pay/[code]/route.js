import { NextResponse } from 'next/server';
import { getPayment } from '@/lib/payment';

export async function GET(_req, { params }) {
  const p = await getPayment(params.code);
  if (!p) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  if (p.error) return NextResponse.json({ error: p.error }, { status: 502 });
  return NextResponse.json(p, { headers: { 'Cache-Control': 'no-store' } });
}
