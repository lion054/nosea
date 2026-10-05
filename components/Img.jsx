import Image from 'next/image';

// A cover image that fills its (relative, sized) parent. The portal serves large WebP originals, so every use says how wide it really renders.
export default function Img({ src, alt = '', sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw', priority = false, quality = 65, className = '' }) {
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} fetchPriority={priority ? 'high' : undefined} quality={quality} className={className} />;
}
