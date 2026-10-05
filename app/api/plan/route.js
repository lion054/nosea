import { NextResponse } from 'next/server';
import { buildPlan } from '@/lib/planner';
import { limited, ipOf } from '@/lib/rateLimit';

export async function POST(req) {
  if (limited(`plan:${ipOf(req)}`, 30, 60 * 1000)) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  let b; try { b = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  try { return NextResponse.json(await buildPlan(b || {})); } catch (e) { console.error('[plan]', e.message); return NextResponse.json({ error: 'Could not build a plan right now.' }, { status: 500 }); }
}
