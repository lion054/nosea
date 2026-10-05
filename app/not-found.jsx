import Link from 'next/link';
export default function NotFound() {
  return <div className="max-w-xl mx-auto px-6 py-32 text-center"><p className="eyebrow mb-4">404</p><h1 className="display text-6xl tracking-tightest mb-4">Off the map.</h1><p className="text-stone-600 mb-8">That page does not exist, or the trip has moved.</p><Link href="/experiences" className="inline-block bg-ink text-bone px-8 py-4 eyebrow hover:bg-sienna transition">See experiences</Link></div>;
}
