import { getJourneys } from '@/lib/catalog';
import Browser from '@/components/Browser';

export const revalidate = 300;
export const metadata = { title: 'Multi-day journeys', description: 'Multi-day safaris and tours across Zimbabwe, Botswana and Namibia, with the day-by-day plan up front.' };

export default async function Page({ searchParams }) {
  const items = await getJourneys();
  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-20">
      <p className="eyebrow mb-4">Journeys</p>
      <h1 className="display text-5xl md:text-8xl tracking-tightest leading-[0.95] mb-6">Go <em className="text-sienna" style={{ fontStyle: 'italic' }}>further.</em></h1>
      <p className="text-stone-600 max-w-xl mb-12 leading-relaxed">Multi-day trips with every day laid out. Each can be shortened, extended or reshaped. Just ask.</p>
      <Browser items={items} noun="journeys" initialQuery={searchParams?.q || ''} />
    </div>
  );
}
