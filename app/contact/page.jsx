import EnquiryForm from '@/components/EnquiryForm';
import { SITE, waLink } from '@/lib/site';
export const metadata = { title: 'Contact', description: 'Reach Nosea Safaris by WhatsApp, phone or email.' };
export default function Page() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-8 grid md:grid-cols-12 gap-12">
      <div className="md:col-span-5">
        <p className="eyebrow mb-4">Contact</p>
        <h1 className="display text-5xl md:text-7xl tracking-tightest leading-[0.98] mb-8">Say <em className="text-sienna" style={{ fontStyle: 'italic' }}>hello.</em></h1>
        <ul className="space-y-5">
          <li><p className="eyebrow text-stone-500 mb-1">WhatsApp</p><a className="display text-2xl tracking-tightest underline" href={waLink('Hello Nosea Safaris')}>{SITE.phone}</a></li>
          <li><p className="eyebrow text-stone-500 mb-1">Email</p><a className="display text-2xl tracking-tightest underline" href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
          <li><p className="eyebrow text-stone-500 mb-1">Based in</p><p className="display text-2xl tracking-tightest">{SITE.base}</p></li>
        </ul>
      </div>
      <div className="md:col-span-7"><EnquiryForm compact /></div>
    </div>
  );
}
