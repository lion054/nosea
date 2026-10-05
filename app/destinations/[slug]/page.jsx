import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDestinations } from '@/lib/destinationData';
import { MONTHS, SHORT, seasonLabel, DESTINATIONS } from '@/lib/destinations';
import Img from '@/components/Img';
import ListingCard from '@/components/ListingCard';
import SeasonPicker from '@/components/SeasonPicker';

export const revalidate = 300;
export async function generateStaticParams() { return DESTINATIONS.map((d) => ({ slug: d.slug })); }
export async function generateMetadata(props) {
  const params = await props.params;
  const d = DESTINATIONS.find((x) => x.slug === params.slug);
  return d ? { title: d.name, description: `${d.blurb} Best time to go: ${seasonLabel(d)}.` } : {};
}

export default async function Page(props) {
  const params = await props.params;
  const d = (await getDestinations()).find((x) => x.slug === params.slug);
  if (!d) notFound();
  const exp = d.trips.filter((t) => t.kind === 'experience');
  const jou = d.trips.filter((t) => t.kind === 'journey');
  const others = (await getDestinations()).filter((x) => x.slug !== d.slug && x.trips.length).slice(0, 4);
  return (
    <>
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden bg-ink grain">
        <Img src={d.photo} alt={d.name} sizes="100vw" priority className="object-cover opacity-90" />
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/30 to-transparent" />
        <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 h-full flex flex-col justify-end pb-12 text-bone">
          <nav className="eyebrow text-bone/70 mb-4"><Link href="/destinations" className="hover:text-bone">Destinations</Link> / {d.country}</nav>
          <h1 className="display text-6xl md:text-9xl tracking-tightest leading-[0.9]">{d.name}</h1>
          <p className="text-xl text-bone/85 mt-4 max-w-xl">{d.tag}</p>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5"><p className="eyebrow mb-4">About</p><p className="text-lg leading-relaxed text-stone-600">{d.blurb}</p><p className="eyebrow mt-8 text-stone-500">Usually best: {seasonLabel(d)}</p></div>
        <div className="md:col-span-7"><p className="eyebrow mb-4">When to go</p><SeasonPicker best={d.best} notes={d.seasons} months={MONTHS} short={SHORT} /></div>
      </section>

      {exp.length > 0 && <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-16"><h2 className="display text-4xl md:text-5xl tracking-tightest mb-8">Day experiences</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">{exp.map((t) => <ListingCard key={t.slug} t={t} />)}</div></section>}
      {jou.length > 0 && <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-16"><h2 className="display text-4xl md:text-5xl tracking-tightest mb-8">Journeys that include {d.name}</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">{jou.map((t) => <ListingCard key={t.slug} t={t} />)}</div></section>}

      <section className="bg-sunset text-bone py-16"><div className="max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col md:flex-row md:items-center justify-between gap-6"><h3 className="display text-3xl md:text-5xl tracking-tightest leading-tight max-w-[20ch]">Want {d.name} your way?</h3><Link href={`/plan?dest=${d.slug}`} className="inline-block bg-ink text-bone px-8 py-4 eyebrow hover:bg-bone hover:text-ink transition">Plan my trip</Link></div></section>

      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-16"><h2 className="display text-3xl tracking-tightest mb-6">More places</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{others.map((o) => <Link key={o.slug} href={`/destinations/${o.slug}`} className="border border-ink/15 p-5 hover:bg-ink hover:text-bone transition"><p className="eyebrow text-stone-500 mb-2">{o.country}</p><p className="display text-2xl tracking-tightest">{o.name}</p></Link>)}</div></section>
    </>
  );
}
