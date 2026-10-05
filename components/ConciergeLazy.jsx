'use client';
import dynamic from 'next/dynamic';

// The chat is not needed for the first paint: load it after the page is interactive.
const Concierge = dynamic(() => import('./Concierge'), { ssr: false });
export default function ConciergeLazy() { return <Concierge />; }
