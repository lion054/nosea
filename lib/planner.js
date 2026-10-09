import 'server-only';
import { getAll, tanova } from './catalog';
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

/**
 * What Tanova plans for this brief, as the tours it would use. Tanova is the authority on what can really be put in a trip
 * (what runs on the dates, fits the party and the money, and how many days a journey takes); the choice among those, and the
 * words about it, stay here. One request per place Nosea has trips in. Null when the portal cannot be asked.
 */
async function portalPool(all, a) {
  if (!process.env.TANOVA_API_BASE || !process.env.TANOVA_API_KEY) return null;
  const places = [...new Set(all.map((t) => t.locationId).filter(Boolean))]
    .filter((id) => !a.dest || all.some((t) => t.locationId === id && destinationsFor(t).some((d) => d.slug === a.dest)))
    .slice(0, 5);
  if (!places.length) return null;
  const day = (d) => d.toISOString().slice(0, 10);
  const earliest = new Date(Date.now() + 21 * 86400000);
  let start = earliest;
  if (a.month) { start = new Date(Date.UTC(earliest.getUTCFullYear(), a.month - 1, 15)); if (start < earliest) start = new Date(Date.UTC(earliest.getUTCFullYear() + 1, a.month - 1, 15)); }
  const days = Math.max(1, a.days);
  const end = new Date(start.getTime() + days * 86400000);
  const cap = BUDGETS[a.budget];
  const ids = new Set();
  const ok = await Promise.all(places.map(async (place) => {
    try {
      const res = await tanova('/tanova/generate', { method: 'POST', body: {
        destination: 'Nosea', place_id: place, start_date: day(start), end_date: day(end), guests: a.travellers,
        ...(Number.isFinite(cap) ? { budget_amount: Math.max(50, cap * a.travellers) } : { budget: 'luxury' }),
        length_flex: days >= 3 ? 2 : 0,
      } });
      if (!res.ok) return false;
      const id = (await res.json())?.data?.id;
      if (!Number.isInteger(id)) return false;
      const tr = await tanova(`/tanova/trips/${id}`);
      if (!tr.ok) return false;
      for (const p of (await tr.json())?.data?.itinerary || []) {
        if (p.tour_id) ids.add(Number(p.tour_id));
        for (const d of p.itinerary || []) for (const x of d.activities || []) {
          const n = Number(String(x.service_id || '').replace(/\D/g, ''));
          if (n) ids.add(n);
        }
      }
      return true;
    } catch { return false; }
  }));
  return ok.some(Boolean) && ids.size ? ids : null;
}

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
  const catalogue = await getAll();
  // Tanova says which of the trips can be put together for this brief; with no answer, plan from all of them as before.
  const fromPortal = await portalPool(catalogue, a);
  const narrowed = fromPortal ? catalogue.filter((t) => fromPortal.has(Number(t.id))) : [];
  const all = narrowed.length ? narrowed : catalogue;
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
