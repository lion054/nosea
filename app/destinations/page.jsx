import { getDestinations } from '@/lib/destinationData';
import DestinationTile from '@/components/DestinationTile';

export const revalidate = 300;
export const metadata = { title: 'Destinations', description: 'Victoria Falls, Hwange, Mana Pools, Great Zimbabwe, the Eastern Highlands, Namibia and the Okavango: where Nosea Safaris goes, and the best time to go.' };

export default async function Page() {
  const dests = (await getDestinations()).filter((d) => d.trips.length);
  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-20">
      <p className="eyebrow mb-4">Destinations</p>
      <h1 className="display text-5xl md:text-8xl tracking-tightest leading-[0.95] mb-6">Where we <em className="text-sienna" style={{ fontStyle: 'italic' }}>go.</em></h1>
      <p className="text-stone-600 max-w-xl mb-12 leading-relaxed">Eight places we know well. Each page shows what is on, when it is at its best, and the trips that go there.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {dests.map((d, i) => <DestinationTile key={d.slug} d={d} photo={d.photo} count={d.trips.length} big={i === 0} className={`aspect-4/5 ${i === 0 ? 'lg:col-span-2 lg:row-span-2 lg:aspect-auto' : ''}`} />)}
      </div>
    </div>
  );
}
