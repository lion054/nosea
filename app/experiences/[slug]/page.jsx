import Detail, { detailMeta } from '@/components/Detail';
import { getAll } from '@/lib/catalog';

export const revalidate = 300;
export const dynamicParams = true;
export async function generateStaticParams() { return (await getAll()).filter((t) => t.kind === 'experience').map((t) => ({ slug: t.slug })); }
export async function generateMetadata({ params }) { return detailMeta(params.slug, 'experience'); }
export default function Page({ params }) { return <Detail slug={params.slug} kind="experience" />; }
