'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send, ArrowUpRight, RotateCcw, Phone } from 'lucide-react';
import { waLink, SITE } from '@/lib/site';

const KEY = 'nosea_chat_v1';
const STARTERS = ['A day trip near Harare', 'Victoria Falls in July', 'Ideas for a week-long safari', 'What can I do for under $100?'];
const WELCOME = { role: 'assistant', content: 'Hello, I am the Nosea concierge. Tell me where you would like to go or what you enjoy, and I will suggest real trips with prices. Or build a full plan in a minute.', pageLinks: [{ label: 'Build my trip →', url: '/plan' }], followUps: STARTERS };

// Only the formatting the assistant is allowed to use.
function safeHtml(html = '') {
  return html.replace(/<(?!\/?(strong|em|br)\b)[^>]*>/gi, '').replace(/&(?!(bull|amp|nbsp|mdash|ndash|rsquo|lsquo);)/g, '&amp;').replace(/\n/g, '<br>');
}

function HandoffForm({ subject, transcript, onDone }) {
  const [s, setS] = useState({ busy: false, error: '', sent: false });
  async function submit(e) {
    e.preventDefault(); setS({ busy: true, error: '', sent: false });
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const message = `${subject || 'Chat handoff'}\n\nConversation:\n${transcript}`;
    const r = await fetch('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: f.name, email: f.email, phone: f.phone, message, interest: 'Website chat' }) }).catch(() => null);
    if (r?.ok) { setS({ busy: false, error: '', sent: true }); onDone?.(); } else setS({ busy: false, error: 'Could not send. Please WhatsApp us instead.', sent: false });
  }
  if (s.sent) return <p className="text-sm bg-paper border border-ink/10 p-3 mt-3">Thank you, the team has your details and the conversation. We usually reply within a working day.</p>;
  const f = 'w-full bg-transparent border-b border-ink/30 py-2 text-sm focus:outline-none focus:border-sienna';
  return (
    <form onSubmit={submit} className="mt-3 border border-ink/15 bg-paper p-3 space-y-2">
      <p className="eyebrow text-stone-500">Pass this to the team</p>
      <input required name="name" placeholder="Your name" className={f} autoComplete="name" />
      <input required type="email" name="email" placeholder="Email" className={f} autoComplete="email" />
      <input name="phone" placeholder="WhatsApp (optional)" className={f} autoComplete="tel" />
      {s.error && <p className="text-xs text-red-700">{s.error}</p>}
      <button disabled={s.busy} className="bg-ink text-bone px-4 py-2 eyebrow hover:bg-sienna transition disabled:opacity-50">{s.busy ? 'Sending…' : 'Send to the team'}</button>
    </form>
  );
}

export default function Concierge() {
  const pathname = usePathname();
  const lift = pathname === '/plan' ? 'bottom-24' : 'bottom-5';
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const end = useRef(null); const box = useRef(null);

  useEffect(() => { try { const r = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (Array.isArray(r) && r.length) setMsgs(r); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) try { sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-30))); } catch {} }, [msgs, ready]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs, open]);
  useEffect(() => { if (!open) return; const on = (e) => e.key === 'Escape' && setOpen(false); window.addEventListener('keydown', on); return () => window.removeEventListener('keydown', on); }, [open]);
  useEffect(() => { document.body.style.overflow = open && window.innerWidth < 768 ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  useEffect(() => { const on = () => setOpen(true); window.addEventListener('nosea:chat', on); return () => window.removeEventListener('nosea:chat', on); }, []);

  const send = useCallback(async (text) => {
    const t = (text ?? input).trim(); if (!t || busy) return;
    setInput('');
    const next = [...msgs.map((m) => ({ ...m, followUps: undefined })), { role: 'user', content: t }];
    setMsgs([...next, { role: 'assistant', content: '', streaming: true }]); setBusy(true);
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next.filter((m) => m !== WELCOME).map((m) => ({ role: m.role, content: m.content.replace(/<[^>]+>/g, ' ') })) }) });
      if (!res.ok || !res.body) throw new Error(String(res.status));
      const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = ''; let text = '';
      for (;;) {
        const { done, value } = await reader.read(); if (done) break;
        buf += dec.decode(value, { stream: true }); const parts = buf.split('\n\n'); buf = parts.pop();
        for (const p of parts) {
          if (!p.startsWith('data: ')) continue;
          const d = JSON.parse(p.slice(6));
          if (d.t) { text += d.t; setMsgs((m) => [...m.slice(0, -1), { role: 'assistant', content: text, streaming: true }]); }
          if (d.done) setMsgs((m) => [...m.slice(0, -1), { role: 'assistant', content: d.finalContent || text, pageLinks: d.pageLinks, followUps: d.followUps, needsHuman: d.needsHuman, humanSubject: d.humanSubject }]);
        }
      }
    } catch {
      setMsgs((m) => [...m.slice(0, -1), { role: 'assistant', content: `I could not reach the assistant just now. You can WhatsApp the team on <strong>${SITE.phone}</strong> or use the trip planner.`, pageLinks: [{ label: 'Build my trip →', url: '/plan' }] }]);
    } finally { setBusy(false); }
  }, [input, msgs, busy]);

  const transcript = msgs.filter((m) => m !== WELCOME && m.content).map((m) => `${m.role === 'user' ? 'Visitor' : 'Concierge'}: ${m.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`).join('\n');
  const reset = () => { setMsgs([WELCOME]); try { sessionStorage.removeItem(KEY); } catch {} };

  return (
    <>
      {!open && (
        <div className={`fixed ${lift} right-4 z-40 pb-[env(safe-area-inset-bottom)]`}>
          <button onClick={() => setOpen(true)} className="bg-sunset text-bone pl-4 pr-5 h-14 rounded-full shadow-xl flex items-center gap-2 hover:scale-105 transition" aria-label="Open the Nosea concierge"><MessageCircle size={20} /> <span className="eyebrow">Plan with us</span></button>
        </div>
      )}
      {open && (
        <div role="dialog" aria-label="Nosea concierge" className="fixed z-50 inset-0 md:inset-auto md:bottom-5 md:right-5 md:w-[400px] md:h-[620px] md:max-h-[calc(100vh-2.5rem)] bg-bone border border-ink/15 shadow-2xl flex flex-col">
          <header className="bg-ink text-bone px-4 py-3 flex items-center justify-between shrink-0">
            <div><p className="display text-xl tracking-tightest leading-none">Nosea concierge</p><p className="eyebrow text-bone/60 mt-1">Real trips · real prices</p></div>
            <div className="flex items-center gap-1">
              <a href={waLink('Hello Nosea Safaris')} className="w-9 h-9 flex items-center justify-center hover:bg-bone/10" aria-label="WhatsApp"><Phone size={16} /></a>
              <button onClick={reset} className="w-9 h-9 flex items-center justify-center hover:bg-bone/10" aria-label="Start over"><RotateCcw size={16} /></button>
              <button onClick={() => setOpen(false)} className="w-9 h-9 flex items-center justify-center hover:bg-bone/10" aria-label="Close"><X size={18} /></button>
            </div>
          </header>
          <div ref={box} className="flex-1 overflow-y-auto px-4 py-4 space-y-4" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
                {m.role === 'user' ? <p className="bg-ink text-bone px-4 py-2.5 text-sm max-w-[85%]">{m.content}</p> : (
                  <div className="max-w-[92%]">
                    {m.content ? <div className="text-sm leading-relaxed text-ink" dangerouslySetInnerHTML={{ __html: safeHtml(m.content) }} /> : <span className="inline-flex gap-1 py-2" aria-label="Typing">{[0, 1, 2].map((d) => <i key={d} className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: `${d * 120}ms` }} />)}</span>}
                    {m.pageLinks?.length > 0 && <div className="flex flex-col gap-2 mt-3">{m.pageLinks.map((l) => <Link key={l.url + l.label} href={l.url} onClick={() => setOpen(false)} className="flex items-center justify-between gap-3 border border-ink/20 px-3 py-2.5 text-sm hover:bg-ink hover:text-bone transition"><span>{l.label.replace(/\s*→\s*$/, '')}</span><ArrowUpRight size={14} /></Link>)}</div>}
                    {m.needsHuman && i === msgs.length - 1 && <HandoffForm subject={m.humanSubject} transcript={transcript} />}
                    {m.followUps?.length > 0 && i === msgs.length - 1 && !busy && <div className="flex flex-wrap gap-2 mt-3">{m.followUps.map((f) => <button key={f} onClick={() => send(f)} className="text-xs border border-ink/20 px-3 py-1.5 hover:border-sienna hover:text-sienna-dark transition">{f}</button>)}</div>}
                  </div>
                )}
              </div>
            ))}
            <div ref={end} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-ink/10 p-3 flex gap-2 shrink-0">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about a trip…" maxLength={500} className="flex-1 bg-transparent border border-ink/20 px-3 py-2.5 text-sm focus:outline-none focus:border-ink" aria-label="Your message" />
            <button disabled={busy || !input.trim()} className="bg-ink text-bone w-11 flex items-center justify-center hover:bg-sienna transition disabled:opacity-40" aria-label="Send"><Send size={16} /></button>
          </form>
        </div>
      )}
    </>
  );
}
