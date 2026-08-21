import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import { LANGUAGES } from '@/lib/i18n';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, User, Globe, Download } from 'lucide-react';
import DownloadScreen from '@/screens/DownloadScreen';

export default function AuthScreen() {
  const { t, lang, setLang } = useI18n();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (mode === 'signup' && !name.trim()) {
      setError(t('auth.error_name'));
      return;
    }
    if (!email || !password) {
      setError(t('auth.error_empty'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.error_short_pw'));
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (error) throw error;
        if (!data.session) {
          setSuccessMsg(t('auth.success_signup'));
          setMode('signin');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('auth.error_generic');
      setError(msg.includes('Invalid login') || msg.includes('Invalid login credentials') ? t('auth.error_invalid') : msg);
    } finally {
      setLoading(false);
    }
  };

  const socialAuth = async (provider: 'google' | 'apple') => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : `${provider} sign-in failed.`);
      setLoading(false);
    }
  };

  const currentLang = LANGUAGES.find((l) => l.code === lang);

  return (
    <div className="min-h-screen flex flex-col bg-onyx text-cream relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-emerald-deep/40 blur-[100px]" />
        <div className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-gold/15 blur-[90px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-emerald-mid/20 blur-[80px]" />
      </div>

      {/* Language switcher */}
      <button
        onClick={() => setLangOpen((s) => !s)}
        className="absolute top-14 right-6 z-20 flex items-center gap-2 glass rounded-full px-3.5 py-2 border border-cream/10 active:scale-95 transition safe-top"
      >
        <Globe className="w-4 h-4 text-gold" />
        <span className="text-[13px] font-semibold text-paper">{currentLang?.flag} {currentLang?.nativeName}</span>
      </button>

      {langOpen && (
        <div className="absolute top-24 right-6 z-30 glass rounded-2xl border border-cream/10 p-2 w-48 animate-float-in shadow-xl">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setLangOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition active:scale-95 ${
                lang === l.code ? 'bg-gold/15' : 'hover:bg-cream/5'
              }`}
            >
              <span className="text-lg">{l.flag}</span>
              <span className={`text-[13px] font-semibold ${lang === l.code ? 'text-gold' : 'text-paper'}`}>
                {l.nativeName}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1 flex flex-col justify-between px-7 pt-16 pb-10 safe-top safe-bottom max-w-md mx-auto w-full">
        <div className="animate-float-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold to-gold-soft flex items-center justify-center shadow-lg shadow-gold/20">
              <Sparkles className="w-6 h-6 text-emerald-deep" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-paper">
                AfriNova <span className="text-gold">AI</span>
              </h1>
              <p className="text-xs text-cream/50 font-medium">Create. Design. Elevate.</p>
            </div>
          </div>
          <h2 className="font-display text-[2.6rem] leading-[1.05] font-extrabold text-balance mt-8">
            {mode === 'signin' ? t('auth.welcome_back') : t('auth.join')}
          </h2>
          <p className="text-cream/60 text-[15px] mt-2 leading-relaxed">
            {mode === 'signin' ? t('auth.signin_sub') : t('auth.signup_sub')}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4 animate-float-in" style={{ animationDelay: '0.1s' }}>
          <div className="space-y-3">
            {mode === 'signup' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('auth.name')}
                  className="w-full glass rounded-2xl pl-12 pr-4 py-4 text-[15px] text-paper placeholder:text-cream/35 border border-cream/10 focus:border-gold/60 focus:ring-2 focus:ring-gold/20 outline-none transition"
                  autoComplete="name"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" />
              <input
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.email')}
                className="w-full glass rounded-2xl pl-12 pr-4 py-4 text-[15px] text-paper placeholder:text-cream/35 border border-cream/10 focus:border-gold/60 focus:ring-2 focus:ring-gold/20 outline-none transition"
                autoComplete="email"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.password')}
                className="w-full glass rounded-2xl pl-12 pr-12 py-4 text-[15px] text-paper placeholder:text-cream/35 border border-cream/10 focus:border-gold/60 focus:ring-2 focus:ring-gold/20 outline-none transition"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream/70 transition"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-[13px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 animate-fade-in">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="text-[13px] text-emerald-soft bg-emerald-soft/10 border border-emerald-soft/30 rounded-xl px-4 py-3 animate-fade-in">
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold to-gold-soft text-emerald-deep font-bold text-[15px] py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-gold/25 active:scale-[0.98] transition disabled:opacity-60"
          >
            {loading ? t('auth.please_wait') : mode === 'signin' ? t('auth.signin') : t('auth.signup')}
            {!loading && <ArrowRight className="w-4 h-4" strokeWidth={2.5} />}
          </button>

          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-cream/10" />
            <span className="text-xs text-cream/40 font-medium">{t('auth.or_continue')}</span>
            <div className="flex-1 h-px bg-cream/10" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => socialAuth('google')}
              disabled={loading}
              className="glass rounded-2xl py-3.5 flex items-center justify-center gap-2 border border-cream/10 active:scale-[0.97] transition disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
              </svg>
              <span className="text-[14px] font-semibold text-paper">Google</span>
            </button>
            <button
              type="button"
              onClick={() => socialAuth('apple')}
              disabled={loading}
              className="glass rounded-2xl py-3.5 flex items-center justify-center gap-2 border border-cream/10 active:scale-[0.97] transition disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#FAF7F0">
                <path d="M17.05 12.04c-.03-2.6 2.13-3.85 2.23-3.91-1.21-1.77-3.1-2.01-3.77-2.04-1.6-.16-3.13.94-3.94.94-.82 0-2.07-.92-3.41-.89-1.75.03-3.37 1.02-4.27 2.59-1.82 3.16-.46 7.83 1.31 10.39.87 1.26 1.9 2.67 3.25 2.62 1.31-.05 1.8-.84 3.38-.84 1.58 0 2.03.84 3.41.81 1.41-.02 2.3-1.28 3.16-2.55 1-1.47 1.41-2.9 1.43-2.97-.03-.01-2.74-1.05-2.77-4.15zM14.7 4.59c.72-.87 1.2-2.08 1.07-3.29-1.03.04-2.28.69-3.02 1.56-.66.77-1.24 2-1.08 3.18 1.15.09 2.31-.58 3.03-1.45z" />
              </svg>
              <span className="text-[14px] font-semibold text-paper">Apple</span>
            </button>
          </div>
        </form>

        <button
          onClick={() => setShowDownload(true)}
          className="w-full glass border border-gold/20 rounded-2xl py-3.5 flex items-center justify-center gap-2 text-gold font-semibold text-[14px] active:scale-[0.98] transition animate-fade-in"
        >
          <Download className="w-4 h-4" strokeWidth={2.5} /> {t('download.install')}
        </button>

        <div className="text-center animate-fade-in">
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
            className="text-[14px] text-cream/60 font-medium"
          >
            {mode === 'signin' ? t('auth.no_account') : t('auth.have_account')}
            <span className="text-gold font-semibold">
              {mode === 'signin' ? t('auth.signup_link') : t('auth.signin_link')}
            </span>
          </button>
        </div>
      </div>

      {showDownload && <DownloadScreen onClose={() => setShowDownload(false)} />}
    </div>
  );
}
