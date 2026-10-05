import { getAll } from '@/lib/catalog';
import { SITE } from '@/lib/site';
import { DESTINATIONS } from '@/lib/destinations';
export default async function sitemap() {
  const all = await getAll();
  const now = new Date();
  return [
    ...['', '/experiences', '/journeys', '/destinations', '/plan', '/about', '/contact'].map((p) => ({ url: `${SITE.url}${p}`, lastModified: now, priority: p === '' ? 1 : 0.8 })),
    ...DESTINATIONS.map((d) => ({ url: `${SITE.url}/destinations/${d.slug}`, lastModified: now, priority: 0.7 })),
    ...all.map((t) => ({ url: `${SITE.url}/${t.kind === 'journey' ? 'journeys' : 'experiences'}/${t.slug}`, lastModified: now, priority: 0.7 })),
  ];
}
