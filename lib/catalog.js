import 'server-only';
import { cache } from 'react';
import { stockFor, STOCK } from './images';
import localPhotos from './localPhotos.json';

// Nosea's photos are bundled with the site (fast, always available). Anything newer uploaded in the portal is still served from the portal.
const LOCAL = new Set(localPhotos);
const photoUrl = (u) => { const m = typeof u === 'string' && u.match(/\/uploads\/nosea\/([^/?#]+\.webp)$/); return m && LOCAL.has(m[1]) ? `/photos/${m[1]}` : u; };

const BASE = process.env.TANOVA_API_BASE;
const KEY = process.env.TANOVA_API_KEY;
const PACKAGE_MIN_HOURS = 16;

export async function tanova(path, { revalidate = 300, method = 'GET', body } = {}) {
  if (!BASE || !KEY) throw new Error('TANOVA_API_BASE / TANOVA_API_KEY are not set.');
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    ...(method === 'GET' ? { next: { revalidate } } : { cache: 'no-store' }),
  });
  return res;
}

// Content comes from Nosea's own portal, but strip anything executable before it is rendered as HTML.
const clean = (html = '') => html.replace(/<(script|style|iframe)[\s\S]*?<\/\1>/gi, '').replace(/\son\w+="[^"]*"/gi, '').replace(/javascript:/gi, '');
const text = (html = '') => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

// The portal stores "Highlights" / "What to bring" as <h4> + <ul> blocks inside the description: lift them out into their own lists.
function parseContent(html = '') {
  let body = clean(html);
  const grab = (title) => {
    const re = new RegExp(`<h4>\\s*${title}\\s*</h4>\\s*<ul>([\\s\\S]*?)</ul>`, 'i');
    const m = body.match(re);
    if (!m) return [];
    body = body.replace(re, '');
    return [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((x) => text(x[1])).filter(Boolean);
  };
  const highlights = grab('Highlights');
  const bring = grab('What to bring');
  let difficulty = null;
  body = body.replace(/<p>\s*<strong>\s*Difficulty:?\s*<\/strong>\s*([^<]*)<\/p>/i, (_, d) => ((difficulty = d.trim()), ''));
  let season = null;
  body = body.replace(/<p>\s*<strong>\s*Best season:?\s*<\/strong>\s*([^<]*)<\/p>/i, (_, d) => ((season = d.trim()), ''));
  return { body: body.trim(), highlights, bring, difficulty, season };
}

const hoursLabel = (h) => (h < 24 ? `${h} hour${h === 1 ? '' : 's'}` : `${Math.round(h / 24)} days`);

function map(t) {
  const c = parseContent(t.content);
  const hours = t.duration_hours || t.duration || 0;
  const journey = !!t.is_package || hours >= PACKAGE_MIN_HOURS;
  const days = Math.max(1, Math.round(hours / 24));
  const real = [t.hero_url, ...(t.gallery_urls || [])].filter(Boolean).map(photoUrl);
  const stock = stockFor(t.title, t.category_name, t.id);
  return {
    id: t.id, slug: t.slug, title: t.title, kind: journey ? 'journey' : 'experience',
    tagline: t.short_desc || text(c.body).split(/(?<=[.!?])\s/)[0]?.slice(0, 180) || '',
    bodyHtml: c.body, highlights: c.highlights, bring: c.bring, difficulty: c.difficulty, season: c.season,
    price: Math.round(parseFloat(t.price || 0)),
    hours, duration: hoursLabel(hours), days, nights: Math.max(0, days - 1),
    place: t.location?.name || 'Zimbabwe', address: t.address || '', category: t.category_name || t.activity_type || '',
    minPeople: t.min_people || 1, maxPeople: t.max_people || 20,
    featured: !!t.is_featured,
    photos: real.length ? real : [stock],
    stockPhoto: !real.length,
    includes: (t.include || []).map((i) => i.title),
    excludes: (t.exclude || []).map((i) => i.title),
    itinerary: (t.itinerary || []).map((d) => ({ day: d.day, title: d.name || d.title, desc: d.desc || d.content || '' })),
    faqs: Array.isArray(t.faqs_parsed) ? t.faqs_parsed : [],
    lat: t.map_lat ? Number(t.map_lat) : null, lng: t.map_lng ? Number(t.map_lng) : null,
  };
}

export const getAll = cache(async () => {
  try {
    const out = [];
    for (let page = 1; page <= 5; page++) {
      const res = await tanova(`/services/tours?per_page=100&page=${page}`);
      if (!res.ok) { console.error(`[nosea] portal answered ${res.status} for the catalogue`); break; }
      const j = (await res.json()).data;
      out.push(...(j.data || []));
      if (page >= (j.last_page || 1)) break;
    }
    return out.filter((t) => t.status === 'publish').map(map);
  } catch (e) {
    console.error('[nosea] catalogue unavailable:', e.name);
    return [];
  }
});

export const getExperiences = async () => (await getAll()).filter((t) => t.kind === 'experience').sort((a, b) => Number(b.featured) - Number(a.featured) || a.price - b.price);
export const getJourneys = async () => (await getAll()).filter((t) => t.kind === 'journey').sort((a, b) => Number(b.featured) - Number(a.featured) || a.days - b.days);
export const getBySlug = async (slug) => (await getAll()).find((t) => t.slug === slug) || null;
export { STOCK };
