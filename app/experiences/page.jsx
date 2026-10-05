import { getExperiences } from '@/lib/catalog';
import Browser from '@/components/Browser';

export const revalidate = 300;
export const metadata = { alternates: { canonical: '/experiences' }, title: 'Day experiences', description: 'Game drives, sanctuary visits, cruises, hikes and cultural days across Zimbabwe and Namibia. Live availability, book online.' };

export default async function Page(props) {
  const searchParams = await props.searchParams;
  const items = await getExperiences();
  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-20">
      <p className="eyebrow mb-4">Day experiences</p>
      <h1 className="display text-5xl md:text-8xl tracking-tightest leading-[0.95] mb-6">A day, <em className="text-accent" style={{ fontStyle: 'italic' }}>well spent.</em></h1>
      <p className="text-stone-600 max-w-xl mb-12 leading-relaxed">From a morning with elephants to a sunset on the Zambezi. Pick a date, see the seats left, and book.</p>
      <Browser items={items} noun="experiences" initialQuery={searchParams?.q || ''} />
    </div>
  );
}
