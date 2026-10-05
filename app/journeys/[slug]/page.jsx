import Detail, { detailMeta } from '@/components/Detail';
import { getAll } from '@/lib/catalog';

export const revalidate = 300;
export const dynamicParams = true;
export async function generateStaticParams() { return (await getAll()).filter((t) => t.kind === 'journey').map((t) => ({ slug: t.slug })); }
export async function generateMetadata({ params }) { return detailMeta(params.slug, 'journey'); }
export default function Page({ params }) { return <Detail slug={params.slug} kind="journey" />; }
