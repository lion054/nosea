import Detail, { detailMeta } from '@/components/Detail';
import { getAll } from '@/lib/catalog';

export const revalidate = 300;
export const dynamicParams = true;
export async function generateStaticParams() { return (await getAll()).filter((t) => t.kind === 'journey').map((t) => ({ slug: t.slug })); }
export async function generateMetadata(props) { const { slug } = await props.params; return detailMeta(slug, 'journey'); }
export default async function Page(props) { const { slug } = await props.params; return <Detail slug={slug} kind="journey" />; }
