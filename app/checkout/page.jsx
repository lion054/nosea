import { redirect } from 'next/navigation';
import { getBySlug } from '@/lib/catalog';
import CheckoutForm from '@/components/CheckoutForm';
export const metadata = { title: 'Checkout', robots: { index: false } };
export default async function Page(props) {
  const searchParams = await props.searchParams;
  const t = await getBySlug(searchParams?.slug || '');
  const date = searchParams?.date || '';
  if (!t || !/^\d{4}-\d{2}-\d{2}$/.test(date)) redirect('/experiences');
  return <CheckoutForm trip={{ slug: t.slug, title: t.title, photo: t.photos[0], price: t.price, duration: t.duration, place: t.place, journey: t.kind === 'journey' }} date={date} adults={parseInt(searchParams.adults || '2', 10) || 2} children={parseInt(searchParams.children || '0', 10) || 0} />;
}
