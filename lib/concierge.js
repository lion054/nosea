import 'server-only';
import { getAll } from './catalog';
import { DESTINATIONS, MONTHS, seasonLabel, tripsFor } from './destinations';
import { SITE } from './site';

export const RESPOND_TOOL = {
  name: 'respond',
  description: 'Send your reply to the visitor. Put the message in "content" FIRST. Links belong in page_links, not in the text.',
  input_schema: {
    type: 'object',
    required: ['content', 'page_links'],
    properties: {
      content: { type: 'string', description: 'HTML body: <strong>, <br><br>, &bull; only. No links, no question lines that belong in follow-ups.' },
      page_links: { type: 'array', description: 'Buttons under the message. Always at least one.', items: { type: 'object', required: ['label', 'url'], properties: { label: { type: 'string' }, url: { type: 'string' }, type: { type: 'string', enum: ['plan', 'experience', 'journey', 'destination', 'default'] } } } },
      suggested_follow_ups: { type: 'array', items: { type: 'string' }, description: '2-3 short follow-up questions, under 50 characters.' },
      needs_human: { type: 'boolean', description: 'True when a person from the team should follow up (custom quote, group, special needs, ready to book, upset visitor).' },
      human_subject: { type: 'string', description: 'Short subject line for the team when needs_human is true.' },
    },
  },
};

const money = (n) => `USD ${Number(n).toLocaleString('en-US')}`;
const plainText = (h = '') => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
// Every address the assistant may link to: a model that invents a page cannot send a visitor to a 404.
export async function knownPaths() {
  const all = await getAll();
  return new Set(['/plan', '/experiences', '/journeys', '/destinations', '/contact', '/about', ...all.map((t) => pathFor(t)), ...DESTINATIONS.map((d) => `/destinations/${d.slug}`)]);
}

export const pathFor = (t) => `/${t.kind === 'journey' ? 'journeys' : 'experiences'}/${t.slug}`;

export async function catalogContext() {
  const all = await getAll();
  const line = (t) => {
    const it = t.itinerary.length ? ` Days: ${t.itinerary.map((d) => `${d.day}. ${d.title}`).join('; ')}.` : '';
    return `- ${t.title} [${t.kind}] ${pathFor(t)} | ${t.kind === 'journey' ? `${t.days} days` : t.duration} | from ${money(t.price)} per person | ${t.place} | group ${t.minPeople}-${t.maxPeople} | ${t.tagline}${t.includes.length ? ` Includes: ${t.includes.join(', ')}.` : ''}${t.excludes.length ? ` Excludes: ${t.excludes.join(', ')}.` : ''}${it}`;
  };
  const dest = DESTINATIONS.map((d) => `- ${d.name} (${d.country}) /destinations/${d.slug} | usually best ${seasonLabel(d)} | ${d.blurb}`).join('\n');
  return `\n\nLIVE CATALOG (the only trips that exist; prices are per person in USD)\n${all.map(line).join('\n')}\n\nDESTINATIONS\n${dest}\n\nTODAY: ${new Date().toISOString().slice(0, 10)}`;
}

export const SYSTEM = `You are the Nosea Safaris concierge, the website assistant for Nosea Safaris, a travel company based in Harare, Zimbabwe, running day experiences and multi-day journeys across Zimbabwe, Botswana and Namibia.

VOICE
- Warm, direct and knowledgeable, like a well-travelled friend. Two to four short sentences. One idea at a time.
- HTML only: <strong>bold</strong>, <br><br> between paragraphs, &bull; for bullets. No markdown, no links in the text.
- Never say you are an AI model or name any AI company. You are "the Nosea concierge".

HOW YOU HELP
1. Recommend specific trips from the LIVE CATALOG by name, length and "from USD x per person". Never invent a trip, price, date, inclusion or slug. If nothing fits, say so and offer the trip planner (/plan) or a human planner.
2. Always give 1-3 page_links: the trip page (/experiences/slug or /journeys/slug), a destination page (/destinations/slug), or /plan. Use short labels ending with an arrow, e.g. "See the Hwange game drive →".
3. For dates and seasons, use the destination's usual best months and be honest that conditions vary. For exact availability tell them to pick a date on the trip page: the calendar shows the open days and seats left.
4. Planning a trip: ask ONE question at a time (where or what, when, how many people, how many days). Once you know enough, recommend a journey or a mix of day experiences and say roughly what it costs per person. Offer "Build my trip" (/plan) to get a full plan.
5. Booking: the site books online with a secure payment page. You cannot take payment or confirm a booking in chat.

DO NOT GUESS
- You do not know visa rules, health requirements, cancellation or refund terms, children's prices, exact park fees or private-vehicle rates. Say you will have the team confirm, set needs_human true, and suggest WhatsApp ${SITE.phone}.
- Do not promise discounts, upgrades or availability.

HUMAN HANDOFF (needs_human true)
Group of more than 8, custom itineraries, special needs, a visitor ready to book who wants a person, anything you cannot answer from the catalog, or a frustrated visitor. Say warmly that you are passing it to the team; a form under your message will collect their name and email, so do not ask for them in the text.

CONTACT: WhatsApp ${SITE.phone}, ${SITE.email}. Replies by email usually within a working day.

FOLLOW-UPS: after most answers add 2-3 short suggested_follow_ups. Leave empty when handing off.`;

// ── Offline engine: used when the AI is unavailable. Built from the same live catalogue, so it never goes stale. ──
const STOP = new Set('the a an and or of to in on at for with is are do you we i me my our can what how when where which about trip tour tours day days go going want like need have any some there this that it be'.split(' '));
const words = (s) => (s.toLowerCase().match(/[a-z']+/g) || []).filter((w) => w.length > 2 && !STOP.has(w));

export function searchTrips(q, all, limit = 3) {
  const qs = words(q);
  if (!qs.length) return [];
  return all.map((t) => {
    const hay = `${t.title} ${t.tagline} ${t.place} ${t.category} ${plainText(t.bodyHtml)} ${t.itinerary.map((d) => d.title).join(' ')}`.toLowerCase();
    const title = t.title.toLowerCase();
    let s = 0; for (const w of qs) { if (title.includes(w)) s += 4; else if (hay.includes(w)) s += 1; }
    return { t, s };
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, limit).map((x) => x.t);
}

const link = (t) => ({ label: `${t.kind === 'journey' ? 'See the journey' : 'See the day'}: ${t.title} →`, url: pathFor(t), type: t.kind });

export async function offlineReply(message) {
  const all = await getAll();
  const m = message.toLowerCase();
  const plan = { label: 'Build my trip →', url: '/plan', type: 'plan' };
  const talk = `WhatsApp <strong>${SITE.phone}</strong> or email <strong>${SITE.email}</strong>.`;

  if (/\b(hi|hello|hey|good (morning|afternoon|evening)|hallo)\b/.test(m) && m.length < 40) {
    return { content: `Hello, and welcome to Nosea Safaris. Tell me where you would like to go, or what kind of day you are after, and I will point you to the right trip.`, page_links: [{ label: 'Browse experiences →', url: '/experiences', type: 'default' }, plan], suggested_follow_ups: ['A day trip near Harare', 'Victoria Falls in July', 'Multi-day safari ideas'] };
  }
  if (/\b(whatsapp|phone|call|contact|email|speak|talk to|human|person|agent)\b/.test(m)) {
    return { content: `You can reach the team directly: ${talk} We usually reply within a working day.`, page_links: [{ label: 'Contact us →', url: '/contact', type: 'default' }], suggested_follow_ups: [], needs_human: true, human_subject: 'Visitor wants to speak to the team' };
  }
  if (/\b(visa|vaccin|yellow fever|malaria|insurance|refund|cancel|cancellation|policy|deposit|child price|children price|kids price)\b/.test(m)) {
    return { content: `That is one the team should answer properly, because it depends on your nationality and dates. I will pass it on: leave your details below, or message us on ${talk}`, page_links: [{ label: 'Contact us →', url: '/contact', type: 'default' }], suggested_follow_ups: [], needs_human: true, human_subject: `Question: ${message.slice(0, 80)}` };
  }
  if (/\b(book|pay|payment|reserve|checkout)\b/.test(m)) {
    return { content: `Booking is online: open a trip, choose a date on the calendar (it shows the open days and seats left), pick your party size and continue to our secure payment page. Not sure which trip? Tell me what you like.`, page_links: [{ label: 'Browse experiences →', url: '/experiences', type: 'default' }, { label: 'Browse journeys →', url: '/journeys', type: 'default' }], suggested_follow_ups: ['What is the cheapest day trip?', 'Show me multi-day journeys'] };
  }
  // A place named (optionally with a month): answer about that place first.
  const mentioned = DESTINATIONS.find((d) => d.match.test(message) || d.name.toLowerCase().split(' ').every((w) => m.includes(w)));
  if (mentioned) {
    const mi = MONTHS.findIndex((x) => m.includes(x.toLowerCase())) + 1;
    const trips = tripsFor(mentioned, all).sort((a, b) => a.price - b.price);
    if (trips.length) {
      const season = mi ? `${MONTHS[mi - 1]}: ${mentioned.seasons[mi] || (mentioned.best.includes(mi) ? 'a good time to go.' : 'not usually the best month, but it can still work.')} ` : `It is usually best in ${seasonLabel(mentioned)}. `;
      return { content: `<strong>${mentioned.name}</strong>. ${mentioned.tag}. ${season}<br><br>We have ${trips.length} ${trips.length === 1 ? 'trip' : 'trips'} there, from <strong>${money(trips[0].price)}</strong> per person (${trips[0].title}).`, page_links: [{ label: `${mentioned.name} guide →`, url: `/destinations/${mentioned.slug}`, type: 'destination' }, ...trips.slice(0, 2).map(link)].slice(0, 3), suggested_follow_ups: ['What is included?', 'Build me a plan', 'Something cheaper'] };
    }
  }
  const cap = (m.match(/(?:under|below|less than|up to|max(?:imum)?|within|around)\s*(?:usd|\$)?\s*(\d{2,5})/) || [])[1];
  if (cap) {
    const within = all.filter((t) => t.price <= Number(cap)).sort((a, b) => b.price - a.price);
    if (within.length) return { content: `${within.length === 1 ? 'One trip fits' : `${within.length} trips fit`} under <strong>${money(cap)}</strong> per person. The one closest to your budget is <strong>${within[0].title}</strong> at ${money(within[0].price)}.`, page_links: [...within.slice(0, 2).map(link), plan], suggested_follow_ups: ['Show me something bigger', 'Build me a plan'] };
    const cheapest = [...all].sort((a, b) => a.price - b.price)[0];
    return { content: `Nothing in our catalog is under ${money(cap)} per person: the lowest is <strong>${cheapest.title}</strong> from ${money(cheapest.price)}. The team can sometimes suggest options for tighter budgets.`, page_links: [link(cheapest), plan], suggested_follow_ups: [], needs_human: true, human_subject: `Budget under ${money(cap)}` };
  }
  if (/\b(cheap|cheapest|budget|affordable|price|cost|how much)\b/.test(m)) {
    const exp = all.filter((t) => t.kind === 'experience').sort((a, b) => a.price - b.price).slice(0, 3);
    const jou = all.filter((t) => t.kind === 'journey').sort((a, b) => a.price - b.price)[0];
    if (exp.length) return { content: `Day experiences start from <strong>${money(exp[0].price)}</strong> per person (${exp[0].title}). ${jou ? `Multi-day journeys start from <strong>${money(jou.price)}</strong> (${jou.title}, ${jou.days} days).` : ''} Prices are per person; your exact total is shown at checkout.`, page_links: [...exp.slice(0, 2).map(link), plan], suggested_follow_ups: ['Something for a family', 'Best time to visit?'] };
  }
  if (/\b(best time|when to|which month|season|weather|july|august|september|october|november|december|january|february|march|april|may|june)\b/.test(m)) {
    const mi = MONTHS.findIndex((x) => m.includes(x.toLowerCase())) + 1;
    if (mi) {
      const good = DESTINATIONS.filter((d) => d.best.includes(mi) && tripsFor(d, all).length).slice(0, 3);
      if (good.length) return { content: `<strong>${MONTHS[mi - 1]}</strong> works well for ${good.map((d) => d.name).join(', ')}. ${good[0].seasons[mi] || ''}`, page_links: [...good.map((d) => ({ label: `${d.name} in ${MONTHS[mi - 1]} →`, url: `/destinations/${d.slug}`, type: 'destination' })), plan].slice(0, 3), suggested_follow_ups: ['How many days do I need?', 'Show me trips'] };
    }
    return { content: `It depends on where you are going. Each destination page has a month-by-month guide. As a rule, the dry months (roughly May to October) are best for wildlife; Victoria Falls is at its fullest around March to May.`, page_links: [{ label: 'Destinations →', url: '/destinations', type: 'destination' }, plan], suggested_follow_ups: ['Victoria Falls', 'Hwange', 'Namibia'] };
  }
  if (/\b(plan|itinerary|custom|tailor|build|honeymoon|group|family|kids|anniversary)\b/.test(m)) {
    return { content: `Happy to help shape it. The trip planner takes about a minute: who is travelling, when, how long and what you love, and it builds a plan from our real trips. For something fully custom, a planner can take it from there.`, page_links: [plan, { label: 'Contact the team →', url: '/contact', type: 'default' }], suggested_follow_ups: ['I have 4 days', 'Travelling with kids'], needs_human: /group|custom|tailor/.test(m), human_subject: 'Custom or group trip' };
  }
  const found = searchTrips(message, all, 3);
  if (found.length) {
    const t = found[0];
    return { content: `A good match is <strong>${t.title}</strong>: ${t.kind === 'journey' ? `${t.days} days` : t.duration}, from <strong>${money(t.price)}</strong> per person. ${t.tagline}${found.length > 1 ? `<br><br>You might also like ${found.slice(1).map((x) => `<strong>${x.title}</strong>`).join(' or ')}.` : ''}`, page_links: [...found.map(link), plan].slice(0, 3), suggested_follow_ups: ['When is it open?', 'What is included?', 'Something different'] };
  }
  return { content: `I am not sure I have that one. Tell me a place or the kind of day you want (animals, adventure, culture, a walk) and I will suggest something, or the team can help directly on ${talk}`, page_links: [{ label: 'Browse experiences →', url: '/experiences', type: 'default' }, plan], suggested_follow_ups: ['Wildlife day trips', 'Victoria Falls', 'Multi-day safaris'], needs_human: true, human_subject: `Unanswered: ${message.slice(0, 80)}` };
}
