import 'server-only';
import { getAll } from './catalog';
import { DESTINATIONS, destinationsFor, MONTHS } from './destinations';

export const INTERESTS = [
  { id: 'wildlife', label: 'Wildlife', blurb: 'Game drives, sanctuaries, birds', re: /game|safari|elephant|wildlife|sanctuary|rhino|lion|giraffe|cheetah|antelope|bird|big five|conservancy/i },
  { id: 'adventure', label: 'Adventure', blurb: 'Dunes, rapids, big views', re: /raft|zip|swing|bungee|dune|climb|helicopter|quad|adrenaline|devil'?s pool|sandboard/i },
  { id: 'culture', label: 'Culture & history', blurb: 'Ruins, heritage, people', re: /cultur|heritage|ruins|village|museum|histor|rock art|living museum|engraving/i },
  { id: 'nature', label: 'Walks & landscapes', blurb: 'Hikes, mountains, big skies', re: /walk|hike|trail|highland|forest|mountain|escarpment|landscape|desert|dunes?|sossusvlei|deadvlei/i },
  { id: 'water', label: 'On the water', blurb: 'Cruises, river, the Falls', re: /cruise|river|zambezi|canoe|mokoro|falls|boat|kayak/i },
  { id: 'relaxed', label: 'Easy and relaxed', blurb: 'Slow days, good food', re: /sunset|picnic|tea|lodge|snacks|relax|easy|spa|lunch/i },
];

const BUDGETS = { low: 400, mid: 1500, high: 4000, any: Infinity };
const text = (t) => `${t.title} ${t.tagline} ${t.category} ${(t.bodyHtml || '').replace(/<[^>]+>/g, ' ')} ${t.highlights.join(' ')} ${t.itinerary.map((d) => `${d.title} ${d.desc}`).join(' ')}`;

function score(t, a) {
  const tx = text(t);
  const matched = (a.interests || []).filter((id) => INTERESTS.find((i) => i.id === id)?.re.test(tx));
  let s = matched.length * 3;
  const dests = destinationsFor(t);
  const inSeason = a.month ? dests.filter((d) => d.best.includes(a.month)) : [];
  if (a.month && dests.length) s += inSeason.length ? 2 : -1;
  if (a.dest && dests.some((d) => d.slug === a.dest)) s += 4;
  const cap = BUDGETS[a.budget] ?? Infinity;
  if (t.price <= cap) s += 1; else s -= 3;
  const hard = /moderate|hard|strenuous|challenging/i.test(t.difficulty || '');
  if (a.who === 'family' && hard) s -= 2;
  if (a.who === 'family' && /easy/i.test(t.difficulty || '')) s += 1;
  if (a.who === 'solo' && t.maxPeople >= 8) s += 0;
  return { t, s, matched, inSeason, dests };
}

const why = (x, a) => {
  const bits = [];
  if (x.matched.length) bits.push(`Fits your interest in ${x.matched.map((id) => INTERESTS.find((i) => i.id === id).label.toLowerCase()).join(' and ')}`);
  if (a.month && x.inSeason.length) bits.push(`${MONTHS[a.month - 1]} is a good month for ${x.inSeason[0].name}`);
  if (a.dest && x.dests.some((d) => d.slug === a.dest)) bits.push(`Goes where you asked`);
  return bits.join('. ') || 'A well-rounded choice from our trips';
};

const shape = (x, a, extra = {}) => ({ slug: x.t.slug, kind: x.t.kind, title: x.t.title, tagline: x.t.tagline, photo: x.t.photos[0], stock: x.t.stockPhoto, price: x.t.price, duration: x.t.duration, days: x.t.days, place: x.t.place, why: why(x, a), url: `/${x.t.kind === 'journey' ? 'journeys' : 'experiences'}/${x.t.slug}`, ...extra });

export async function buildPlan(raw) {
  const a = {
    who: ['couple', 'family', 'friends', 'solo', 'group'].includes(raw.who) ? raw.who : 'couple',
    travellers: Math.min(40, Math.max(1, parseInt(raw.travellers, 10) || 2)),
    interests: (Array.isArray(raw.interests) ? raw.interests : String(raw.interests || '').split(',')).filter((i) => INTERESTS.some((x) => x.id === i)),
    days: Math.min(21, Math.max(1, parseInt(raw.days, 10) || 1)),
    month: raw.month ? Math.min(12, Math.max(1, parseInt(raw.month, 10))) : null,
    budget: ['low', 'mid', 'high', 'any'].includes(raw.budget) ? raw.budget : 'any',
    dest: DESTINATIONS.some((d) => d.slug === raw.dest) ? raw.dest : null,
  };
  const all = await getAll();
  const scored = all.map((t) => score(t, a));
  const exps = scored.filter((x) => x.t.kind === 'experience').sort((x, y) => y.s - x.s);
  const jous = scored.filter((x) => x.t.kind === 'journey');
  const party = (pp) => pp * a.travellers;

  // Journeys whose length is close to what they asked for (never much longer).
  const fit = jous.map((x) => ({ ...x, gap: x.t.days - a.days })).filter((x) => x.gap <= 1 && x.gap >= -Math.max(2, Math.ceil(a.days * 0.4))).sort((x, y) => (y.s - Math.abs(y.gap)) - (x.s - Math.abs(x.gap)));

  let plan;
  if (a.days >= 3 && fit.length) {
    const best = fit[0];
    const bestDests = new Set(best.dests.map((d) => d.slug));
    const spare = a.days - best.t.days;
    const addOns = spare > 0 ? exps.filter((x) => x.dests.some((d) => bestDests.has(d.slug))).slice(0, Math.min(2, spare)).map((x) => shape(x, a, { optional: true })) : [];
    const pp = best.t.price;
    plan = { type: 'journey', title: best.t.title, days: best.t.days, items: [shape(best, a)], addOns, perPerson: pp, party: party(pp), note: spare > 0 ? `Your ${a.days} days are a little longer than this ${best.t.days}-day journey, so you could add a day trip${addOns.length ? ' (suggestions below)' : ''} or ask us to extend it.` : best.gap === 1 ? `This runs ${best.t.days} days, one more than you asked for. Ask us if it can be trimmed.` : null };
  } else {
    // A run of day experiences, one a day, spread across different places and kinds.
    const chosen = []; const seenPlaces = new Set(); const seenKinds = new Set();
    for (const x of exps) {
      if (chosen.length >= a.days) break;
      const key = x.dests[0]?.slug || x.t.place; const kind = x.t.category;
      if (chosen.length && seenPlaces.has(key) && seenKinds.has(kind)) continue;
      chosen.push(x); seenPlaces.add(key); seenKinds.add(kind);
    }
    const items = chosen.map((x, i) => shape(x, a, { day: i + 1 }));
    const pp = chosen.reduce((s, x) => s + x.t.price, 0);
    plan = { type: 'days', title: a.days === 1 ? chosen[0]?.t.title || 'Your day' : `${chosen.length} days of day trips`, days: chosen.length, items, addOns: [], perPerson: pp, party: party(pp), note: chosen.length < a.days ? `We found ${chosen.length} ${chosen.length === 1 ? 'day' : 'days'} that suit you. For the rest, a planner can build in rest days or travel.` : null };
  }
  const cap = BUDGETS[a.budget] ?? Infinity;
  if (plan.perPerson > cap) plan.note = [`This is above the budget you chose (about $${plan.perPerson.toLocaleString('en-US')} per person). Day trips are the most affordable way in; see the ideas below, or ask us what can be trimmed.`, plan.note].filter(Boolean).join(' ');
  const used = new Set(plan.items.map((i) => i.slug));
  const alternatives = [...fit.filter((x) => !used.has(x.t.slug)).slice(0, 2), ...exps.filter((x) => !used.has(x.t.slug)).slice(0, 3)].slice(0, 3).map((x) => shape(x, a));
  const seen = new Map();
  if (a.month) plan.items.forEach((i) => destinationsFor(all.find((t) => t.slug === i.slug)).forEach((d) => seen.set(d.slug, d)));
  const seasons = [...seen.values()].map((d) => ({ name: d.name, slug: d.slug, note: d.seasons[a.month] || null, good: d.best.includes(a.month) }));
  return { answers: a, plan, alternatives, seasons };
}
