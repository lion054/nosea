// Stand-in photography until Nosea uploads its own in the portal (hero + gallery). The portal's own photos always win.
const U = (id) => `https://images.unsplash.com/${id}?w=1600&q=80&auto=format&fit=crop`;

export const STOCK = {
  hero: U('photo-1516426122078-c23e76319801'),
  elephant: U('photo-1535941339077-2dd1c7963098'),
  giraffe: U('photo-1523805009345-7448845a9e53'),
  sunset: U('photo-1547471080-7cc2caa01a7e'),
  rhino: U('photo-1547970810-dc1eac37d174'),
  forest: U('photo-1549366021-9f761d450615'),
  camp: U('photo-1504280390367-361c6d9f38f4'),
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
