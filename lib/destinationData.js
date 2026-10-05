import 'server-only';
import { getAll } from './catalog';
import { DESTINATIONS, tripsFor } from './destinations';
import { STOCK } from './images';

const FALLBACK = { 'victoria-falls': STOCK.giraffe, hwange: STOCK.elephant, 'mana-pools': STOCK.forest, harare: STOCK.rhino, 'great-zimbabwe': STOCK.sunset, 'eastern-highlands': STOCK.forest, namibia: STOCK.sunset, okavango: STOCK.camp };

// Each destination with its live trips and the best real photo among them (stock only when no trip has one).
export async function getDestinations() {
  const all = await getAll();
  return DESTINATIONS.map((d) => {
    const trips = tripsFor(d, all);
    const real = trips.find((t) => !t.stockPhoto);
    return { ...d, trips, photo: real ? real.photos[0] : FALLBACK[d.slug] };
  });
}
