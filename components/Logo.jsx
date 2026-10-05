import Image from 'next/image';

// "dark" = dark lettering for light backgrounds; "light" = white lettering for dark backgrounds.
const SIZE = { plain: [1016, 467], tagline: [693, 404] };

export default function Logo({ variant = 'dark', tagline = false, className = 'h-12 w-auto', priority = false }) {
  const [w, h] = SIZE[tagline ? 'tagline' : 'plain'];
  return <Image src={`/brand/logo${tagline ? '-tagline' : ''}-${variant}.png`} alt="Nosea Safaris" width={w} height={h} sizes="200px" priority={priority} className={className} />;
}
