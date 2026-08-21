import { useState } from 'react';
import { LANGUAGES, type LangCode, useI18n } from '@/lib/i18n';
import { Sparkles, Check, ArrowRight } from 'lucide-react';

export default function LanguageScreen() {
  const { setLang } = useI18n();
  const [selected, setSelected] = useState<LangCode | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-onyx text-cream relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-emerald-deep/40 blur-[100px]" />
        <div className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-gold/15 blur-[90px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-emerald-mid/20 blur-[80px]" />
      </div>

      <div className="relative flex-1 flex flex-col px-7 pt-16 pb-10 safe-top safe-bottom max-w-md mx-auto w-full">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-10 animate-float-in">
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

        <div className="animate-float-in" style={{ animationDelay: '0.08s' }}>
          <h2 className="font-display text-[2rem] leading-tight font-extrabold text-balance">
            Choisissez votre langue
          </h2>
          <p className="text-cream/55 text-sm mt-2">
            Sélectionnez la langue de votre choix · Select your language · Wählen Sie Ihre Sprache · 选择您的语言
          </p>
        </div>

        {/* Language list */}
        <div className="flex-1 mt-7 space-y-2.5 overflow-y-auto no-scrollbar">
          {LANGUAGES.map((l, i) => {
            const isSel = selected === l.code;
            return (
              <button
                key={l.code}
                onClick={() => setSelected(l.code)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border transition active:scale-[0.98] animate-fade-in ${
                  isSel
                    ? 'bg-gold/10 border-gold/50'
                    : 'glass border-cream/10'
                }`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <span className="text-2xl">{l.flag}</span>
                <div className="flex-1 text-left">
                  <p className={`font-display font-bold text-[15px] ${isSel ? 'text-gold' : 'text-paper'}`}>
                    {l.nativeName}
                  </p>
                  <p className="text-[12px] text-cream/45">{l.name}</p>
                </div>
                {isSel && (
                  <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-deep" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Continue button */}
        <button
          onClick={() => selected && setLang(selected)}
          disabled={!selected}
          className={`mt-6 w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-[15px] transition active:scale-[0.98] ${
            selected
              ? 'bg-gradient-to-r from-gold to-gold-soft text-emerald-deep shadow-lg shadow-gold/25'
              : 'glass text-cream/30 border border-cream/10'
          }`}
        >
          Continuer
          {selected && <ArrowRight className="w-4 h-4" strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
}
