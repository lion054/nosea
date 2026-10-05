import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Compass, Map, ShieldCheck, CalendarCheck } from 'lucide-react';
import { getExperiences, getJourneys } from '@/lib/catalog';
import { STOCK } from '@/lib/images';
import ListingCard from '@/components/ListingCard';
import Img from '@/components/Img';
import HeroSearch from '@/components/HeroSearch';
import DestinationTile from '@/components/DestinationTile';
import { getDestinations } from '@/lib/destinationData';

export const revalidate = 300;

export default async function Home() {
  const [exp, jou, allDests] = await Promise.all([getExperiences(), getJourneys(), getDestinations()]);
  const dests = allDests.filter((d) => d.trips.length).sort((a, b) => b.trips.length - a.trips.length).slice(0, 5);
  const featured = [...exp.filter((t) => t.featured), ...exp.filter((t) => !t.featured)].slice(0, 6);
  const journeys = jou.slice(0, 3);
  const dispatch = exp.find((t) => /wild is life/i.test(t.title)) || exp.find((t) => t.featured) || null;

  return (
    <>
      <section className="relative min-h-[88svh] grain overflow-hidden bg-ink">
        <Img src={STOCK.hero} alt="A safari vehicle crossing the savanna at sunset" sizes="100vw" priority quality={70} className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/40 to-ink/10" />
        <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 pt-24 pb-10 flex flex-col min-h-[88svh] justify-end text-bone">
          <p className="eyebrow mb-6 text-bone/80 rise rise-1">Harare · Victoria Falls · Hwange · Namibia</p>
          <h1 className="display rise rise-2 text-[clamp(2.75rem,9vw,9rem)] tracking-tightest leading-[0.92] max-w-[14ch] mb-5">
            Experience the <em className="text-sienna-light" style={{ fontStyle: 'italic' }}>wilderness.</em>
          </h1>
          <p className="rise rise-3 text-lg md:text-xl max-w-xl text-bone/85 leading-relaxed mb-10">Day experiences and multi-day journeys across Zimbabwe and Southern Africa, led by a local team that knows the guides, the camps and the back roads.</p>
          <div className="rise rise-4 w-full max-w-4xl"><HeroSearch /></div>
        </div>
        <div className="absolute top-28 right-10 hidden lg:block eyebrow text-bone/70 text-right">17°49′S<br />31°03′E<br />Harare</div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pt-20 md:pt-28" aria-label="Where we go">
        <div className="flex items-end justify-between mb-10">
          <div><p className="eyebrow mb-4">001 — Where we go</p><h2 className="display text-5xl md:text-7xl tracking-tightest leading-none">Pick a <em className="text-accent" style={{ fontStyle: 'italic' }}>place.</em></h2></div>
          <Link href="/destinations" className="hidden md:flex eyebrow items-center gap-2 hover:text-accent-strong transition">All destinations <ArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {dests.map((d, i) => <DestinationTile key={d.slug} d={d} photo={d.photo} count={d.trips.length} big={i === 0} className={i === 0 ? 'col-span-2 row-span-2 aspect-4/3 lg:aspect-auto lg:min-h-[560px]' : 'aspect-4/5'} />)}
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-36">
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-2"><p className="eyebrow">002 — Manifesto</p></div>
          <div className="md:col-span-10">
            <p className="display text-3xl md:text-5xl lg:text-6xl tracking-tightest leading-[1.05] max-w-[22ch]">
              Southern Africa is not a checklist. It is a region of <em className="text-accent" style={{ fontStyle: 'italic' }}>weather,</em> of <em className="text-accent" style={{ fontStyle: 'italic' }}>light,</em> and of people who remember you when you return.
            </p>
            <div className="mt-14 grid md:grid-cols-3 gap-10 max-w-4xl">
              {[['Ground-sourced', 'We work with guides, camps and drivers we know personally, and send guests only where we would go ourselves.'], ['One clear price', 'What is included and what is not is written down before you pay, in US dollars.'], ['Slow by design', 'We pace trips for the landscape, not the itinerary. A good journey has margin in it.']].map(([h, p]) => <div key={h}><p className="eyebrow text-accent-strong mb-3">{h}</p><p className="text-sm leading-relaxed text-ink/80">{p}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="flex items-end justify-between mb-14">
          <div><p className="eyebrow mb-4">003 — Day experiences</p><h2 className="display text-5xl md:text-7xl tracking-tightest leading-none">Start with a <em className="text-accent" style={{ fontStyle: 'italic' }}>day.</em></h2></div>
          <Link href="/experiences" className="hidden md:flex eyebrow items-center gap-2 hover:text-accent-strong transition">All {exp.length} experiences <ArrowRight size={14} /></Link>
        </div>
        {featured.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">{featured.map((t) => <ListingCard key={t.slug} t={t} />)}</div> : <p className="text-stone-500">Experiences are being updated. Please check back shortly.</p>}
      </section>

      {dispatch && (
        <section className="bg-ink text-bone py-24 md:py-36 relative overflow-hidden grain">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-5 relative aspect-portrait"><Img src={dispatch.photos[0]} alt={dispatch.title} sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" /></div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="eyebrow text-sienna-light mb-6">A day we love</p>
              <h3 className="display text-4xl md:text-6xl tracking-tightest leading-[1.05] mb-8">{dispatch.title}</h3>
              <p className="text-stone-200 leading-relaxed max-w-lg mb-8">{dispatch.tagline}</p>
              <Link href={`/experiences/${dispatch.slug}`} className="eyebrow inline-flex items-center gap-2 py-3 text-bone hover:text-sienna-light transition">See the day · from ${dispatch.price} <ArrowUpRight size={14} /></Link>
            </div>
          </div>
        </section>
      )}

      {journeys.length > 0 && (
        <section className="bg-ink text-bone py-24 md:py-32 grain relative">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div className="flex items-end justify-between mb-14">
              <div><p className="eyebrow mb-4 text-sienna-light">004 — Journeys</p><h2 className="display text-5xl md:text-7xl tracking-tightest leading-none">Stay a <em className="text-sienna-light" style={{ fontStyle: 'italic' }}>while.</em></h2></div>
              <Link href="/journeys" className="hidden md:flex eyebrow items-center gap-2 hover:text-sienna-light transition">All journeys <ArrowRight size={14} /></Link>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {journeys.map((t) => (
                <Link key={t.slug} href={`/journeys/${t.slug}`} className="group block relative aspect-3/4 overflow-hidden bg-stone-600">
                  <Img src={t.photos[0]} alt={t.title} sizes="(min-width: 768px) 33vw, 100vw" className="card-img object-cover opacity-80 group-hover:opacity-100 transition" />
                  <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="eyebrow text-sienna-light mb-2">{t.days} days · from ${t.price.toLocaleString()}</p>
                    <h3 className="display text-3xl md:text-4xl tracking-tightest leading-none mb-2">{t.title}</h3>
                    <p className="text-sm text-bone/75 line-clamp-2">{t.tagline}</p>
                  </div>
                  <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-bone/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><ArrowUpRight size={15} /></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-32">
        <p className="eyebrow mb-4">005 — Why Nosea</p>
        <h2 className="display text-5xl md:text-6xl tracking-tightest leading-none mb-14 max-w-[16ch]">Local people, <em className="text-accent" style={{ fontStyle: 'italic' }}>real</em> plans.</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            [Compass, 'Planned by locals', 'A Harare team that knows the guides, the camps and the roads.'],
            [CalendarCheck, 'Live availability', 'See the dates that are open and the seats left, then book in minutes.'],
            [ShieldCheck, 'Pay securely', 'Your payment is taken on a secure hosted page. We never see your card.'],
            [Map, 'Your trip, your way', 'Add a night, swap a camp, build a loop. Tell us and we shape it.'],
          ].map(([Icon, h, p]) => <div key={h} className="border-t border-ink pt-5"><Icon size={22} strokeWidth={1.4} className="text-accent mb-4" /><h3 className="display text-2xl tracking-tightest mb-2">{h}</h3><p className="text-stone-600 leading-relaxed text-sm">{p}</p></div>)}
        </div>
      </section>

      <section className="bg-sunset text-bone py-20 md:py-28 relative overflow-hidden grain">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-8"><p className="eyebrow text-bone/80 mb-4">Something custom?</p><h3 className="display text-4xl md:text-6xl tracking-tightest leading-[1.05]">Tell us the trip you have in mind. We will plan it.</h3></div>
          <div className="md:col-span-4 md:text-right"><Link href="/plan" className="inline-flex items-center gap-3 bg-ink text-bone px-8 py-5 hover:bg-bone hover:text-ink transition"><span className="eyebrow">Plan my trip</span><ArrowUpRight size={18} strokeWidth={1.5} /></Link></div>
        </div>
      </section>
    </>
  );
}
