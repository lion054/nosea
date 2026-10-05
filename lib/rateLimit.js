// Small in-memory limiter: enough to blunt form spam on a single-process deployment.
const hits = new Map();
export function limited(key, max = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return arr.length > max;
}
export const ipOf = (req) => (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
