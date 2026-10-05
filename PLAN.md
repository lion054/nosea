# Nosea Safaris — noseasafaris.com

The Musha design system (bone paper, editorial serif, mono eyebrows, grain, hairlines), re-coloured to the Nosea
sunset (impala-sun orange on charcoal) and wired to the live Tanova portal (tenant: Nosea Safaris, Kuda plan: Stay OS,
Exp OS, Trans OS). One Next.js 14 app; every listing, price, itinerary, seat count and booking comes from the portal,
so a change made in the portal shows on the site within minutes and never needs a redeploy.

## Phase 1 — Foundation and a site that books (built and working locally)
- Brand: logos cut out of the supplied artwork (light and dark versions, mark, favicon, apple icon).
- Design: Musha tokens with `sunset` replacing `sienna`; charcoal `ink`; Fraunces + Instrument Sans + JetBrains Mono.
- Data layer (server only, key never reaches the browser): tours from the portal, split into **Day experiences**
  (under 16 h) and **Journeys** (16 h or more, with the day-by-day itinerary the portal stores).
- Pages: home, experiences (search + filters), experience detail, journeys, journey detail with day-by-day,
  plan-a-trip enquiry, about, contact, checkout, booking confirmed, 404, sitemap, robots, JSON-LD.
- Booking that works: date picker backed by the portal's live availability (closed/full days disabled, seats left,
  phased prices), party size, server-side price (the site never sends a price), redirect to the portal's hosted
  checkout for payment. No card data touches this site.
- Nothing invented: no fake ratings or reviews. Stock photography is clearly a stand-in until Nosea uploads its own.

## Phase 1b — Concierge, planner, destinations (built and working locally)
- **Concierge chat** modelled on the Dare2Travel assistant: streaming answers, trip links, follow-up chips, hand-off to the team (name + email + the whole conversation land in the portal inbox). The prompt is rebuilt from the live catalogue each message; it is told not to guess visas, refunds or child prices. Needs `ANTHROPIC_API_KEY` for the AI; without it a rule-based engine answers from the same catalogue.
- **Trip planner**: who, interests, days, month, budget in; a real plan out (journey, or a run of day trips), indicative total, how each place is that month, other ideas, send-to-planner, shareable link.
- **Destinations** replace the place-name ticker: 8 places with best months, a month-by-month guide and the trips that go there.

## Phase 2 — Make it Nosea's own
- Real photography: upload in the portal (gallery + hero) — the site already prefers them over stock.
- Stays and Transfers sections appear by themselves the moment Nosea lists a hotel/lodge or a vehicle in the portal
  (Stay OS / Trans OS are switched on; nothing listed yet).
- Guest reviews from the portal; "Find my booking" by code + email; wishlist that survives devices.
- Plan-a-trip enquiries land in the portal CRM and WhatsApp (needs a portal enquiry endpoint).
- Multi-currency display (USD/ZAR/ZWG/BWP), language switch (EN + Shona/Ndebele via the portal translation tool).

## Phase 3 — Growth and operations
- Group departures with phased pricing ("first 5 seats $100, next 5 $120") published as a calendar; early-bird badge.
- Traveller trip page: itinerary, packing list, documents, pay balance (portal trip-sheet link per traveller).
- Email/WhatsApp pre-trip sequence from the portal; post-trip review request.
- Blog / destination guides for SEO (Victoria Falls, Hwange, Mana Pools, Namibia); Google Business + Search Console.
- Analytics and conversion funnel; A/B on the hero and booking panel.

## Go-live checklist (needs the owner)
1. **Hosting.** The Tanova server (13.60.79.78) has 1.9 GB RAM, about 130 MB free, and its 2 GB swap is full (2043/2048 MB),
   with several client sites on it. Adding another Node app there risks the OOM killer taking down a client site.
   Either resize the server (4 GB or more) or host this app elsewhere (Vercel, or a small separate VPS, about 512 MB is enough).
2. **DNS.** `noseasafaris.com` currently points at 13.247.190.131. Point it at wherever the app is hosted.
3. **Portal key.** Create a secret API key for Nosea on live (`TANOVA_API_KEY`) and set `TANOVA_API_BASE=https://tanovaapp.com/api/v`.
4. **Photos.** Upload real photos in the portal (hero + gallery); the site uses them automatically instead of stock.
5. Test-pay one booking end to end on live before announcing.
