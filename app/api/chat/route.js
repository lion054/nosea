import Anthropic from '@anthropic-ai/sdk';
import { limited, ipOf } from '@/lib/rateLimit';
import { catalogContext, SYSTEM, RESPOND_TOOL, offlineReply } from '@/lib/concierge';

export const runtime = 'nodejs';
const MODEL = process.env.CONCIERGE_MODEL || 'claude-haiku-4-5-20251001';
const TIMEOUT_MS = 20000;

// Pulls the "content" string out of the streaming tool JSON so the visitor sees words as they are written.
function contentExtractor() {
  let state = 'seek', buf = '', esc = false, text = '';
  return {
    feed(chunk) {
      let out = '';
      for (const ch of chunk) {
        if (state === 'seek') { buf = (buf + ch).slice(-14); if (/"content"\s*:\s*"$/.test(buf)) state = 'read'; }
        else if (state === 'read') {
          if (esc) { esc = false; const d = ch === 'n' ? '\n' : ch === 't' ? '\t' : ch; out += d; text += d; }
          else if (ch === '\\') esc = true;
          else if (ch === '"') state = 'done';
          else { out += ch; text += ch; }
        }
      }
      return out;
    },
    done: () => state === 'done',
    text: () => text,
  };
}

const clean = (h = '') => h.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1').replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>').replace(/(<br\s*\/?>\s*)+$/gi, '').trim();
const safeLinks = (l) => (Array.isArray(l) ? l : []).filter((x) => x?.label && typeof x.url === 'string' && x.url.startsWith('/')).slice(0, 3);

export async function POST(req) {
  if (limited(`chat:${ipOf(req)}`, 20, 60 * 1000)) return new Response(JSON.stringify({ error: 'Too many messages. Please wait a moment.' }), { status: 429 });
  let body;
  try { body = await req.json(); } catch { return new Response('{"error":"bad request"}', { status: 400 }); }
  const messages = (Array.isArray(body.messages) ? body.messages : []).filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim()).slice(-10).map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') return new Response('{"error":"no message"}', { status: 400 });
  const last = messages[messages.length - 1].content;

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(ctrl) {
      const send = (o) => ctrl.enqueue(enc.encode(`data: ${JSON.stringify(o)}\n\n`));
      const finish = (r) => send({ done: true, finalContent: clean(r.content), pageLinks: safeLinks(r.page_links), followUps: (r.suggested_follow_ups || []).slice(0, 3), needsHuman: !!r.needs_human, humanSubject: r.human_subject || null });
      let ok = false;

      if (process.env.ANTHROPIC_API_KEY) {
        try {
          const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, ...(process.env.ANTHROPIC_BASE_URL ? { baseURL: process.env.ANTHROPIC_BASE_URL } : {}) });
          const ac = new AbortController(); const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
          const s = client.messages.stream({ model: MODEL, max_tokens: 1200, system: SYSTEM + (await catalogContext()), tools: [RESPOND_TOOL], tool_choice: { type: 'tool', name: 'respond' }, messages }, { signal: ac.signal });
          const ex = contentExtractor(); let raw = '';
          for await (const ev of s) {
            if (ev.type === 'content_block_delta' && ev.delta.type === 'input_json_delta') {
              raw += ev.delta.partial_json;
              if (!ex.done()) { const out = ex.feed(ev.delta.partial_json); if (out) send({ t: out }); }
            }
          }
          clearTimeout(timer);
          let meta = {}; try { meta = JSON.parse(raw); } catch { const m = raw.match(/\{[\s\S]*\}/); if (m) try { meta = JSON.parse(m[0]); } catch {} }
          meta.content = meta.content || ex.text();
          if (!meta.content) throw new Error('empty reply');
          finish(meta); ok = true;
        } catch (e) { console.warn('[concierge] AI unavailable, using offline engine:', e.message); }
      }
      if (!ok) { finish(await offlineReply(last)); }
      ctrl.close();
    },
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no' } });
}
