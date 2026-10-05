// Stand-in photography until Nosea uploads its own in the portal (hero + gallery). The portal's own photos always win.

export const STOCK = {
  hero: '/stock/hero.webp',
  elephant: '/stock/elephant.webp',
  giraffe: '/stock/giraffe.webp',
  sunset: '/stock/sunset.webp',
  rhino: '/stock/rhino.webp',
  forest: '/stock/forest.webp',
  camp: '/stock/camp.webp',
};
const ORDER = [STOCK.elephant, STOCK.sunset, STOCK.giraffe, STOCK.rhino, STOCK.forest, STOCK.camp, STOCK.hero];

export function stockFor(title = '', category = '', id = 0) {
  const t = `${title} ${category}`.toLowerCase();
  if (/rhino|lion|wildlife|sanctuary|antelope|animal/.test(t)) return STOCK.rhino;
  if (/elephant|hwange|game drive|etosha|safari|mana/.test(t)) return STOCK.elephant;
  if (/dune|sossus|desert|namib/.test(t)) return STOCK.sunset;
  if (/bird|cruise|zambezi|falls/.test(t)) return STOCK.giraffe;
  if (/hike|walk|highland|forest|trail/.test(t)) return STOCK.forest;
  return ORDER[Math.abs(id) % ORDER.length];
}
