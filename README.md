# Nosea Safaris website

Next.js 14 (App Router) + Tailwind, built on the Musha design system and driven live by the Tanova portal API.

```
cp .env.example .env.local   # fill in the key
npm install && npm run dev   # http://localhost:3005
```

Env (server-side only, never `NEXT_PUBLIC_`):
- `TANOVA_API_BASE` e.g. `https://tanovaapp.com/api/v`
- `TANOVA_API_KEY` a **secret** key for the Nosea Safaris vendor (needs services + bookings + concierge scopes)
- `NEXT_PUBLIC_SITE_URL` e.g. `https://noseasafaris.com`
- `ANTHROPIC_API_KEY` (optional) enables the AI concierge. Without it the concierge answers from rules built on the same live catalogue.

Everything shown (experiences, journeys, itineraries, prices, seats) is read from the portal; bookings are created
through `POST /bookings` and the guest is sent to the portal's hosted checkout. See `PLAN.md` for the phased roadmap.


## Concierge, planner, destinations
- `lib/concierge.js` + `app/api/chat`: streaming concierge (Claude Haiku by default, `CONCIERGE_MODEL` to change). The prompt is rebuilt from the live catalogue on every message, so it never quotes a trip or price that does not exist. Falls back to a rule-based engine when the key is missing or the AI is slow. Hand-offs go to the portal inbox via `/api/enquiry`.
- `lib/planner.js` + `components/PlanWizard.jsx`: five questions in, a plan out (a journey, or a run of day trips), with an indicative total, month-by-month notes and a send-to-planner form. Shareable by URL.
- `lib/destinations.js`: destination facts and best months. Trips for each place are matched live.
