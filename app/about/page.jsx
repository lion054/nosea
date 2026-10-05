import Link from 'next/link';
import Img from '@/components/Img';
import { STOCK } from '@/lib/images';
export const metadata = { title: 'About', description: 'Nosea Safaris is a Harare-based travel company running day experiences and multi-day journeys across Zimbabwe and Southern Africa.' };
export default function Page() {
  return (
    <>
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-16 grid md:grid-cols-12 gap-12 items-end">
        <div className="md:col-span-7"><p className="eyebrow mb-4">About</p><h1 className="display text-5xl md:text-8xl tracking-tightest leading-[0.95]">Rooted in <em className="text-sienna" style={{ fontStyle: 'italic' }}>Harare.</em></h1></div>
        <p className="md:col-span-5 text-stone-600 leading-relaxed text-lg">Nosea Safaris plans day experiences and multi-day journeys across Zimbabwe and Southern Africa. Our name and our mark, the sable at the sun, come from the country we work in.</p>
      </section>
      <div className="relative h-[50vh] overflow-hidden"><Img src={STOCK.elephant} alt="" sizes="100vw" className="object-cover" /></div>
      <section className="max-w-[1000px] mx-auto px-6 md:px-10 py-20 grid md:grid-cols-3 gap-10">
        {[['Local first', 'We work with Zimbabwean guides, camps and drivers we know personally, so what we promise is what you get.'], ['Honest planning', 'Clear prices in US dollars, what is and is not included, and the day-by-day plan before you pay.'], ['Flexible by default', 'Every journey can be shortened, extended or reshaped. If it is not on the site, ask.']].map(([h, p]) => <div key={h} className="border-t border-ink pt-5"><h2 className="display text-2xl tracking-tightest mb-2">{h}</h2><p className="text-stone-600 text-sm leading-relaxed">{p}</p></div>)}
      </section>
      <section className="text-center pb-20"><Link href="/plan" className="inline-block bg-ink text-bone px-8 py-4 eyebrow hover:bg-sienna transition">Plan a trip with us</Link></section>
    </>
  );
}
