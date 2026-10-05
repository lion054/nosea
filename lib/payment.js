import 'server-only';
import { tanova } from './catalog';
import { SITE } from './site';

export const CODE_RE = /^[a-f0-9]{32}$/;
export const siteOrigin = () => SITE.url.replace(/\/$/, '');

// What is owed on a booking and how it can be paid, straight from the portal. null when the booking is not found or cannot be paid.
export async function getPayment(code) {
  if (!CODE_RE.test(code)) return null;
  const res = await tanova(`/bookings/${code}/payment`, { revalidate: 0 }).catch(() => null);
  if (!res) return { error: 'unreachable' };
  if (res.status === 404) return null;
  const j = await res.json().catch(() => null);
  if (!res.ok) return { error: j?.error?.message || 'unavailable', code: j?.error?.code };
  return j.data;
}
