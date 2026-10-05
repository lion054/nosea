import { Suspense } from 'react';
import PlanWizard from '@/components/PlanWizard';
import { getDestinations } from '@/lib/destinationData';
import { getAll } from '@/lib/catalog';
import { INTERESTS } from '@/lib/planner';
import { STOCK } from '@/lib/images';

export const revalidate = 300;
export const metadata = { title: 'Plan your trip', description: 'Answer a few quick questions and get a trip built from Nosea Safaris real experiences and journeys, with an indicative price and the best months to go.' };

export default async function Page({ searchParams }) {
  const [dests, all] = await Promise.all([getDestinations(), getAll()]);
  const destinations = dests.filter((d) => d.trips.length).map((d) => ({ slug: d.slug, name: d.name, photo: d.photo, count: d.trips.length }));
  const fallback = { wildlife: STOCK.rhino, adventure: STOCK.sunset, culture: STOCK.giraffe, nature: STOCK.forest, water: STOCK.giraffe, relaxed: STOCK.camp };
  const text = (t) => `${t.title} ${t.tagline} ${(t.bodyHtml || '').replace(/<[^>]+>/g, ' ')}`;
  const interestPhotos = Object.fromEntries(INTERESTS.map((i) => [i.id, (all.find((t) => !t.stockPhoto && i.re.test(text(t))) || { photos: [fallback[i.id]] }).photos[0]]));
  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-14">
      <p className="eyebrow mb-4">Trip planner</p>
      <h1 className="display text-5xl md:text-7xl tracking-tightest leading-[0.98] mb-12 max-w-[16ch]">Tell us what you love. <em className="text-sienna" style={{ fontStyle: 'italic' }}>We will plan it.</em></h1>
      <Suspense fallback={null}><PlanWizard dest={searchParams?.dest || null} destinations={destinations} interestPhotos={interestPhotos} /></Suspense>
    </div>
  );
}
