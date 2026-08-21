import { useAuth } from '@/lib/auth';
import { useI18n, LANGUAGES } from '@/lib/i18n';
import { User, Crown, Bell, Shield, HelpCircle, LogOut, ChevronRight, Globe, Moon } from 'lucide-react';
import { useState } from 'react';

type Props = {
  onUpgrade: () => void;
};

type SettingItem = {
  icon: typeof User;
  labelKey: string;
  sub?: string;
  action?: () => void;
  accent?: boolean;
};

export default function SettingsScreen({ onUpgrade }: Props) {
  const { user, signOut } = useAuth();
  const { t, lang, setLang } = useI18n();
  const [langOpen, setLangOpen] = useState(false);
  const email = user?.email ?? '';
  const fullName = (user?.user_metadata?.full_name as string) || email.split('@')[0];
  const initial = fullName.charAt(0).toUpperCase() || 'A';
  const currentLang = LANGUAGES.find((l) => l.code === lang);

  const groups: { title: string; items: SettingItem[] }[] = [
    {
      title: t('settings.account'),
      items: [
        { icon: User, labelKey: 'settings.profile', sub: email },
        { icon: Crown, labelKey: 'settings.premium', sub: t('settings.free_plan'), action: onUpgrade, accent: true },
        { icon: Bell, labelKey: 'settings.notifications', sub: t('settings.on') },
      ],
    },
    {
      title: t('settings.preferences'),
      items: [
        { icon: Globe, labelKey: 'settings.language', sub: currentLang?.nativeName, action: () => setLangOpen((s) => !s) },
        { icon: Moon, labelKey: 'settings.theme', sub: t('settings.dark') },
      ],
    },
    {
      title: t('settings.support'),
      items: [
        { icon: Shield, labelKey: 'settings.privacy' },
        { icon: HelpCircle, labelKey: 'settings.help' },
      ],
    },
  ];

  return (
    <div className="px-5 pt-14 pb-28 max-w-md mx-auto safe-top">
      <h1 className="font-display text-2xl font-extrabold text-paper mb-5 animate-fade-in">{t('settings.title')}</h1>

      <div className="rounded-3xl bg-gradient-to-br from-emerald-deep to-emerald-mid p-5 mb-6 animate-float-in relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-gold/15 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center text-emerald-deep font-display font-extrabold text-2xl shadow-lg shadow-gold/20">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-lg text-paper truncate">{fullName}</p>
            <p className="text-xs text-cream/60 truncate">{email}</p>
            <span className="inline-block mt-1.5 text-[10px] font-bold text-emerald-deep bg-gold px-2 py-0.5 rounded-full">{t('settings.free_badge')}</span>
          </div>
        </div>
      </div>

      {langOpen && (
        <div className="rounded-2xl glass border border-cream/10 p-2 mb-5 animate-float-in max-h-64 overflow-y-auto no-scrollbar">
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

      {groups.map((group, gi) => (
        <div key={group.title} className="mb-5 animate-fade-in" style={{ animationDelay: `${gi * 0.08}s` }}>
          <p className="text-[11px] text-cream/40 font-bold uppercase tracking-wide mb-2 px-1">{group.title}</p>
          <div className="rounded-2xl glass border border-cream/10 overflow-hidden">
            {group.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.labelKey}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 active:bg-cream/5 transition ${i > 0 ? 'border-t border-cream/5' : ''} ${item.accent ? 'bg-gold/5' : ''}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.accent ? 'bg-gold/15' : 'bg-cream/5'}`}>
                    <Icon className={`w-4.5 h-4.5 ${item.accent ? 'text-gold' : 'text-cream/70'}`} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`text-[14px] font-semibold ${item.accent ? 'text-gold' : 'text-paper'}`}>{t(item.labelKey)}</p>
                    {item.sub && <p className="text-[11px] text-cream/45 truncate">{item.sub}</p>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-cream/25" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button
        onClick={signOut}
        className="w-full rounded-2xl glass border border-red-500/20 py-3.5 flex items-center justify-center gap-2 text-red-300 font-semibold text-[14px] active:scale-[0.98] transition"
      >
        <LogOut className="w-4 h-4" /> {t('settings.sign_out')}
      </button>

      <p className="text-center text-[11px] text-cream/30 mt-6">AfriNova AI · v1.0.0</p>
    </div>
  );
}
