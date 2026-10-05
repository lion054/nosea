// Where Nosea goes. Facts are general travel knowledge; the trips on each page come live from the portal.
// `match` is tested against a trip's title, description and itinerary titles.
export const DESTINATIONS = [
  { slug: 'victoria-falls', name: 'Victoria Falls', country: 'Zimbabwe', tag: 'Mosi-oa-Tunya, the smoke that thunders', match: /victoria falls|livingstone|zambezi|devil'?s pool/i,
    best: [3, 4, 5, 8, 9, 10, 11], blurb: 'One of the great waterfalls of the world, over a kilometre wide on the Zambezi. Walk the rainforest viewpoints, cruise upstream at sunset, or swim at the edge.',
    seasons: { 3: 'The falls are near full flood: huge spray, wet viewpoints.', 4: 'Peak water, thundering views.', 5: 'High water and lush green, fewer crowds.', 6: 'Water starts to drop, cooler dry days.', 7: 'Cool, dry and clear. A good all-round month.', 8: 'Lower water opens the views; dry season begins.', 9: 'Dry and warm. Water is low enough for the edge swims in the season.', 10: 'Low water, hot days, great for river activities.', 11: 'Hot and the first rains. Low water, quiet.', 12: 'Rainy season starts, the river begins to rise.', 1: 'Rainy and green, the river is rising.', 2: 'Rain and rising water; spectacular but wet.' } },
  { slug: 'hwange', name: 'Hwange', country: 'Zimbabwe', tag: "Zimbabwe's largest national park", match: /hwange/i,
    best: [6, 7, 8, 9, 10], blurb: 'Elephants in their thousands and a big list of other game. In the dry months, animals gather at the waterholes and the viewing is at its best.',
    seasons: { 6: 'Dry season begins; game gathers at water.', 7: 'Cool mornings, excellent game viewing.', 8: 'Dry and dusty, big gatherings at the pans.', 9: 'Hot and dry, the best waterhole viewing.', 10: 'The hottest month, peak concentrations. First rains late.', 11: 'Rains arrive; the park turns green and game spreads out.', 12: 'Green season. Quieter, good for birds.', 1: 'Green season and birdlife.', 2: 'Rainy; some roads are difficult.', 3: 'Late rains, lush and quiet.', 4: 'The rains ease, the park is green.', 5: 'Drying out, a good shoulder month.' } },
  { slug: 'mana-pools', name: 'Mana Pools', country: 'Zimbabwe', tag: 'Safari on foot beside the Zambezi', match: /mana pools/i,
    best: [5, 6, 7, 8, 9, 10], blurb: 'A UNESCO World Heritage floodplain where you can walk with a guide among elephants and hippos, with the escarpment behind.',
    seasons: { 5: 'The park opens as the roads dry.', 6: 'Cool, dry and clear.', 7: 'Prime walking weather.', 8: 'Dry; game concentrates on the river.', 9: 'Hot, with outstanding wildlife at the water.', 10: 'The hottest, driest month; very rewarding game viewing.' } },
  { slug: 'harare', name: 'Harare', country: 'Zimbabwe', tag: 'The capital and our home', match: /harare|wild is life|birds at thirty/i,
    best: [4, 5, 6, 7, 8, 9, 10], blurb: 'Our home city, with a mild climate and wildlife on its doorstep: a sanctuary with rescued animals and a bird park for easy days out.',
    seasons: { 5: 'Mild, dry and sunny.', 6: 'Cool mornings, clear days.', 7: 'The coolest month; bring a layer.', 8: 'Dry and warm.', 9: 'Warm and dry.', 10: 'Hot before the rains.', 11: 'Rains start.', 12: 'Wet season.', 1: 'Wet season.', 2: 'Wet season.', 3: 'Rains easing.', 4: 'Dry again.' } },
  { slug: 'great-zimbabwe', name: 'Great Zimbabwe', country: 'Zimbabwe', tag: 'The stone city that gave a country its name', match: /great zimbabwe|masvingo/i,
    best: [4, 5, 6, 7, 8, 9, 10], blurb: 'The remains of a medieval stone city, the largest ancient structure in sub-Saharan Africa, near Masvingo and Lake Mutirikwi.',
    seasons: { 4: 'Dry and comfortable for walking the ruins.', 5: 'Pleasant and clear.', 6: 'Cool and dry.', 7: 'Cool, bring a layer.', 8: 'Dry and warm.', 9: 'Warm, great light.', 10: 'Hot; go early.' } },
  { slug: 'eastern-highlands', name: 'Eastern Highlands', country: 'Zimbabwe', tag: 'Chimanimani, pine forest and quartzite ridges', match: /chimanimani|eastern highlands|manicaland/i,
    best: [4, 5, 6, 7, 8, 9, 10], blurb: 'The green side of Zimbabwe: mountains, streams and forest walks on the border with Mozambique.',
    seasons: { 4: 'Rains have ended; clear and green.', 5: 'Excellent walking weather.', 6: 'Cold nights, crisp days.', 7: 'Cold nights; pack warm layers.', 8: 'Dry, with a chance of bush fires.', 9: 'Warming up, good visibility.', 10: 'Hot, then the first showers.' } },
  { slug: 'namibia', name: 'Namibia', country: 'Namibia', tag: 'Dunes, desert and Etosha', match: /namibia|sossusvlei|deadvlei|etosha|swakopmund|windhoek|damaraland|spitzkoppe|waterberg/i,
    best: [5, 6, 7, 8, 9, 10], blurb: 'A country of enormous skies: the red dunes of Sossusvlei, the Atlantic coast at Swakopmund, granite at Spitzkoppe and the wildlife of Etosha.',
    seasons: { 5: 'Cooler and dry; start of the best season.', 6: 'Cool, dry, clear skies.', 7: 'Cold nights, good game viewing at Etosha waterholes.', 8: 'Dry; waterholes are busy.', 9: 'Warming up; excellent Etosha game viewing.', 10: 'Hot and dry, with very strong game viewing.' } },
  { slug: 'okavango', name: 'Okavango Delta', country: 'Botswana', tag: 'A river that ends in the desert', match: /okavango|botswana/i,
    best: [6, 7, 8, 9, 10], blurb: 'A vast inland delta of channels and islands, explored by mokoro canoe and on foot, at its fullest in the dry months.',
    seasons: { 6: 'Floodwater arrives; the delta fills.', 7: 'Peak water and cool dry days.', 8: 'Full channels and excellent wildlife.', 9: 'Water slowly falls; wildlife is concentrated.', 10: 'Hot and dry; very good game viewing.' } },
];

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const destBySlug = (slug) => DESTINATIONS.find((d) => d.slug === slug) || null;

const plain = (t) => `${t.title} ${(t.bodyHtml || '').replace(/<[^>]+>/g, ' ')} ${(t.itinerary || []).map((d) => `${d.title} ${d.desc}`).join(' ')}`;
export const tripsFor = (dest, trips) => trips.filter((t) => dest.match.test(plain(t)));
export const destinationsFor = (trip) => DESTINATIONS.filter((d) => d.match.test(plain(trip)));

export function seasonLabel(dest) {
  const b = dest.best;
  const runs = []; let start = b[0], prev = b[0];
  for (const m of b.slice(1)) { if (m === prev + 1) { prev = m; continue; } runs.push([start, prev]); start = prev = m; }
  runs.push([start, prev]);
  return runs.map(([a, z]) => (a === z ? SHORT[a - 1] : `${SHORT[a - 1]}–${SHORT[z - 1]}`)).join(', ');
}
