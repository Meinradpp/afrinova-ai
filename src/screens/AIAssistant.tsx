import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import type { ChatMessage } from '@/types';
import { Sparkles, X, Send, MessageCircle } from 'lucide-react';

export default function AIAssistant() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [askedName, setAskedName] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const firstName = (user?.user_metadata?.full_name as string) || (user?.user_metadata?.name as string) || null;

  useEffect(() => {
    if (firstName) {
      setUserName(firstName);
    }
  }, [firstName]);

  const suggestions = [t('ai.sug1'), t('ai.sug2'), t('ai.sug3'), t('ai.sug4')];

  const cannedReply = (prompt: string): string => {
    const p = prompt.toLowerCase();
    const name = userName ?? '';

    // Detect a name being provided (response to "what's your name?")
    if (askedName && prompt.trim().length > 0 && prompt.trim().length < 40 && !p.includes('?')) {
      const cleanName = prompt.trim().split(/\s+/)[0];
      setUserName(cleanName);
      setAskedName(false);
      return t('ai.name_thanks', { name: cleanName });
    }

    const namePrefix = name ? `${name}, ` : '';

    if (p.includes('caption') || p.includes('flyer') || p.includes('légende') || p.includes('传单') || p.includes('flyer'))
      return namePrefix + t('ai.caption_reply');
    if (p.includes('color') || p.includes('palette') || p.includes('farb') || p.includes('颜色') || p.includes('cor'))
      return namePrefix + t('ai.color_reply');
    if (p.includes('name') || p.includes('business') || p.includes('nom') || p.includes('empresa') || p.includes('名字') || p.includes('nome'))
      return namePrefix + t('ai.name_reply');
    if (p.includes('tagline') || p.includes('slogan') || p.includes('口号'))
      return namePrefix + t('ai.tagline_reply');
    return namePrefix + t('ai.default_reply');
  };

  useEffect(() => {
    if (!user || !open) return;
    (async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);
      if (data && data.length) {
        setMessages(data as ChatMessage[]);
      } else {
        const greetContent = firstName
          ? t('ai.greeting_named', { name: firstName })
          : t('ai.ask_name');
        if (!firstName) setAskedName(true);
        const greet: ChatMessage = {
          id: 'local-greet',
          user_id: user.id,
          role: 'assistant',
          content: greetContent,
          created_at: new Date().toISOString(),
        };
        setMessages([greet]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, open, lang]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim() || !user) return;
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      user_id: user.id,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);

    const { error } = await supabase.from('chat_messages').insert({
      user_id: user.id,
      role: 'user',
      content: text,
    });
    if (error) console.warn(error);

    setTimeout(async () => {
      const reply = cannedReply(text);
      const aiMsg: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        user_id: user.id,
        role: 'assistant',
        content: reply,
        created_at: new Date().toISOString(),
      };
      setMessages((m) => [...m, aiMsg]);
      setTyping(false);
      await supabase.from('chat_messages').insert({
        user_id: user.id,
        role: 'assistant',
        content: reply,
      });
    }, 700);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-soft flex items-center justify-center shadow-2xl shadow-gold/40 active:scale-90 transition animate-pulse-ring"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="w-7 h-7 text-emerald-deep" strokeWidth={2.5} />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-onyx/95 backdrop-blur-xl animate-slide-up safe-top safe-bottom">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-cream/10 glass">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gold to-gold-soft flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-deep" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-paper text-[15px]">{t('ai.title')}</h3>
              <p className="text-[11px] text-gold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-soft inline-block" /> {t('ai.online')}
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-full glass border border-cream/10 flex items-center justify-center active:scale-90 transition">
              <X className="w-5 h-5 text-cream/70" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-3 max-w-md mx-auto w-full">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-gold to-gold-soft text-emerald-deep font-semibold rounded-br-md'
                      : 'glass border border-cream/10 text-cream rounded-bl-md'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start animate-fade-in">
                <div className="glass border border-cream/10 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-gold/70"
                      style={{ animation: `float-in 0.6s ${i * 0.15}s infinite alternate` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="px-5 pb-2 max-w-md mx-auto w-full">
              <p className="text-[11px] text-cream/40 font-semibold mb-2 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" /> {t('ai.try_asking')}
              </p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="shrink-0 glass border border-cream/10 rounded-full px-3.5 py-2 text-[12px] text-cream/70 active:scale-95 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="px-5 py-3 border-t border-cream/10 glass max-w-md mx-auto w-full">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send(input)}
                placeholder={t('ai.placeholder')}
                className="flex-1 glass rounded-full px-4 py-3 text-[14px] text-paper placeholder:text-cream/35 border border-cream/10 outline-none focus:border-gold/50 transition"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim()}
                className="w-11 h-11 rounded-full bg-gold flex items-center justify-center active:scale-90 transition disabled:opacity-40 shrink-0"
              >
                <Send className="w-5 h-5 text-emerald-deep" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
