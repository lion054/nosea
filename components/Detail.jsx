import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Users, MapPin, Check, X, Mountain, CalendarDays } from 'lucide-react';
import { getAll } from '@/lib/catalog';
import Gallery from '@/components/Gallery';
import BookingPanel from '@/components/BookingPanel';
import EnquiryForm from '@/components/EnquiryForm';
import ListingCard from '@/components/ListingCard';
import { SITE } from '@/lib/site';

export async function detailMeta(slug, kind) {
  const t = (await getAll()).find((x) => x.slug === slug && x.kind === kind);
  if (!t) return {};
  return { title: t.title, description: t.tagline, openGraph: { title: t.title, description: t.tagline, images: [t.photos[0]] }, alternates: { canonical: `/${kind === 'journey' ? 'journeys' : 'experiences'}/${t.slug}` } };
}

export default async function Detail({ slug, kind }) {
  const all = await getAll();
  const t = all.find((x) => x.slug === slug && x.kind === kind);
  if (!t) notFound();
  const journey = kind === 'journey';
  const related = all.filter((x) => x.kind === kind && x.slug !== t.slug).slice(0, 3);
  const ld = { '@context': 'https://schema.org', '@type': 'TouristTrip', name: t.title, description: t.tagline, image: t.photos[0], touristType: journey ? 'Multi-day safari' : 'Day experience',
    provider: { '@type': 'TravelAgency', name: SITE.name, url: SITE.url }, offers: { '@type': 'Offer', price: t.price, priceCurrency: 'USD', url: `${SITE.url}/${journey ? 'journeys' : 'experiences'}/${t.slug}` },
    ...(t.itinerary.length ? { itinerary: { '@type': 'ItemList', itemListElement: t.itinerary.map((d, i) => ({ '@type': 'ListItem', position: i + 1, name: d.title })) } } : {}) };
  const facts = [[Clock, t.duration], [Users, `${t.minPeople > 1 ? `${t.minPeople}–` : 'Up to '}${t.maxPeople} guests`], [MapPin, t.place], t.difficulty && [Mountain, t.difficulty], t.season && [CalendarDays, `Best: ${t.season}`]].filter(Boolean);
  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-10 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav className="eyebrow text-stone-500 mb-6" aria-label="Breadcrumb"><Link href="/" className="hover:text-ink">Home</Link> / <Link href={journey ? '/journeys' : '/experiences'} className="hover:text-ink">{journey ? 'Journeys' : 'Experiences'}</Link></nav>
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
        <div className="lg:col-span-8">
          <p className="eyebrow text-sienna-dark mb-3">{journey ? `${t.days}-day journey` : t.category}</p>
          <h1 className="display text-5xl md:text-7xl tracking-tightest leading-[0.98] mb-5">{t.title}</h1>
          {t.tagline && <p className="text-xl text-stone-600 leading-relaxed mb-8 max-w-2xl">{t.tagline}</p>}
          <Gallery photos={t.photos} title={t.title} stock={t.stockPhoto} />
          <div className="flex flex-wrap gap-x-8 gap-y-3 my-8 py-5 border-y border-ink/15">{facts.map(([Icon, label], i) => <span key={i} className="flex items-center gap-2 text-sm"><Icon size={16} strokeWidth={1.5} className="text-sienna" /> {label}</span>)}</div>

          {t.bodyHtml && <div className="prose-nosea" dangerouslySetInnerHTML={{ __html: t.bodyHtml }} />}

          {t.highlights.length > 0 && (<section className="mt-12"><h2 className="display text-3xl tracking-tightest mb-5">Highlights</h2><ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">{t.highlights.map((h) => <li key={h} className="flex gap-3"><span className="w-1.5 h-1.5 rounded-full bg-sienna mt-2.5 shrink-0" />{h}</li>)}</ul></section>)}

          {t.itinerary.length > 0 && (
            <section className="mt-14" id="itinerary">
              <p className="eyebrow mb-3">Day by day</p><h2 className="display text-4xl tracking-tightest mb-8">The itinerary</h2>
              <ol className="relative border-l border-ink/20 ml-3 space-y-8">
                {t.itinerary.map((d) => (
                  <li key={d.day} className="pl-8 relative">
                    <span className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-sienna text-bone text-[11px] flex items-center justify-center font-medium">{d.day}</span>
                    <p className="eyebrow text-stone-500 mb-1">Day {d.day}</p>
                    <h3 className="display text-2xl tracking-tightest leading-tight mb-1">{d.title}</h3>
                    {d.desc && <p className="text-stone-600 leading-relaxed max-w-xl">{d.desc}</p>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {(t.includes.length > 0 || t.excludes.length > 0) && (
            <section className="mt-14 grid md:grid-cols-2 gap-10">
              {t.includes.length > 0 && <div><h2 className="display text-3xl tracking-tightest mb-4">Included</h2><ul className="space-y-2.5">{t.includes.map((x) => <li key={x} className="flex gap-3 text-sm"><Check size={16} className="text-miombo mt-0.5 shrink-0" />{x}</li>)}</ul></div>}
              {t.excludes.length > 0 && <div><h2 className="display text-3xl tracking-tightest mb-4">Not included</h2><ul className="space-y-2.5">{t.excludes.map((x) => <li key={x} className="flex gap-3 text-sm text-stone-600"><X size={16} className="text-stone-400 mt-0.5 shrink-0" />{x}</li>)}</ul></div>}
            </section>
          )}

          {t.bring.length > 0 && <section className="mt-12"><h2 className="display text-3xl tracking-tightest mb-4">What to bring</h2><p className="text-stone-700">{t.bring.join(' · ')}</p></section>}

          {t.faqs.length > 0 && <section className="mt-14"><h2 className="display text-3xl tracking-tightest mb-4">Good to know</h2><div className="divide-y divide-ink/15 border-y border-ink/15">{t.faqs.map((f, i) => <details key={i} className="py-4 group"><summary className="cursor-pointer font-medium">{f.title || f.question}</summary><p className="text-stone-600 mt-2 text-sm leading-relaxed">{f.content || f.answer}</p></details>)}</div></section>}

          <section className="mt-16 border border-ink/15 bg-paper p-8"><h2 className="display text-3xl tracking-tightest mb-2">Questions, or want it your way?</h2><p className="text-stone-600 mb-6 text-sm">Ask about dates, add a night, or change the pace. A planner replies by email.</p><EnquiryForm interest={t.title} compact /></section>
        </div>

        <aside className="lg:col-span-4"><div className="lg:sticky lg:top-28"><BookingPanel slug={t.slug} title={t.title} price={t.price} minPeople={t.minPeople} maxPeople={t.maxPeople} journey={journey} /></div></aside>
      </div>

      {related.length > 0 && (<section className="mt-24"><h2 className="display text-4xl tracking-tightest mb-8">You might also like</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{related.map((r) => <ListingCard key={r.slug} t={r} />)}</div></section>)}
    </div>
  );
}
