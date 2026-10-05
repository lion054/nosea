import { NextResponse } from 'next/server';
import { getBySlug, tanova } from '@/lib/catalog';

// Live seats and price per day for one listing, straight from the portal (never cached: seats change by the minute).
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) return NextResponse.json({ error: 'from and to must be dates.' }, { status: 400 });
  const tour = await getBySlug(slug);
  if (!tour) return NextResponse.json({ error: 'Unknown listing.' }, { status: 404 });
  const res = await tanova(`/services/tours/${tour.id}/departures?from=${from}&to=${to}`, { revalidate: 0 });
  if (!res.ok) return NextResponse.json({ days: [] }, { status: 200 });
  const d = (await res.json()).data;
  return NextResponse.json({ mode: d.mode, days: d.days || [] }, { headers: { 'Cache-Control': 'no-store' } });
}
