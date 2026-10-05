import { NextResponse } from 'next/server';
import { tanova } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

// Open /api/health to see why a deployment shows no trips: which settings are present and what the portal answers. No secrets are returned.
export async function GET() {
  const out = { ok: false, env: { TANOVA_API_BASE: !!process.env.TANOVA_API_BASE, TANOVA_API_KEY: !!process.env.TANOVA_API_KEY, NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || null, ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY }, upstream: null, trips: 0 };
  if (!out.env.TANOVA_API_BASE || !out.env.TANOVA_API_KEY) { out.hint = 'Add TANOVA_API_BASE and TANOVA_API_KEY in the host\'s environment variables, then redeploy.'; return NextResponse.json(out, { status: 503 }); }
  try {
    const res = await tanova('/services/tours?per_page=100', { revalidate: 0 });
    out.upstream = res.status;
    if (res.ok) { const j = await res.json(); out.trips = (j?.data?.data || []).filter((t) => t.status === 'publish').length; out.ok = out.trips > 0; }
    else out.hint = res.status === 401 ? 'The portal rejected the key: check TANOVA_API_KEY.' : res.status === 403 ? 'The portal refused this host (blocked or scope missing).' : 'The portal returned an error.';
  } catch (e) { out.upstream = 'unreachable'; out.hint = `Could not reach the portal: ${e.message}. Check TANOVA_API_BASE.`; }
  return NextResponse.json(out, { status: out.ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } });
}
