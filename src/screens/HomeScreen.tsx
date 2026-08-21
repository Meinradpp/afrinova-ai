import { Search, Bell, Sparkles, Crown, ArrowRight, TrendingUp, Wand2, Download } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useState } from 'react';
import DownloadScreen from '@/screens/DownloadScreen';

export type Category = {
  id: string;
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
  gradient: string;
  accent: string;
  premium?: boolean;
};

const CATEGORIES: Category[] = [
  { id: 'ai-design', titleKey: 'cat.ai_design', descKey: 'cat.ai_design_desc', icon: Wand2, gradient: 'from-emerald-deep to-emerald-mid', accent: '#FFD700' },
  { id: 'ai-writing', titleKey: 'cat.ai_writing', descKey: 'cat.ai_writing_desc', icon: Sparkles, gradient: 'from-onyx-card to-onyx-soft', accent: '#FFD700' },
  { id: 'ai-images', titleKey: 'cat.ai_images', descKey: 'cat.ai_images_desc', icon: TrendingUp, gradient: 'from-emerald-mid to-emerald-soft', accent: '#FAF7F0' },
  { id: 'social-media', titleKey: 'cat.social', descKey: 'cat.social_desc', icon: Bell, gradient: 'from-onyx-soft to-onyx-card', accent: '#FFD700' },
  { id: 'digital-products', titleKey: 'cat.digital', descKey: 'cat.digital_desc', icon: Crown, gradient: 'from-emerald-deep to-onyx-card', accent: '#FFD700' },
  { id: 'business-tools', titleKey: 'cat.business', descKey: 'cat.business_desc', icon: ArrowRight, gradient: 'from-emerald-soft to-emerald-deep', accent: '#FAF7F0' },
  { id: 'premium', titleKey: 'cat.premium', descKey: 'cat.premium_desc', icon: Crown, gradient: 'from-gold to-gold-soft', accent: '#004B23', premium: true },
];

type Props = {
  onOpenCategory: (cat: Category) => void;
  userName?: string;
};

export default function HomeScreen({ onOpenCategory, userName }: Props) {
  const { t } = useI18n();
  const [showDownload, setShowDownload] = useState(false);
  const firstName = userName?.split('@')[0]?.split(' ')[0] || 'Creator';

  return (
    <div className="px-5 pt-14 pb-28 space-y-6 max-w-md mx-auto safe-top">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <p className="text-xs text-cream/50 font-medium">{t('home.welcome')}</p>
          <h1 className="font-display text-2xl font-extrabold text-paper capitalize">{firstName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full glass border border-cream/10 flex items-center justify-center active:scale-95 transition">
            <Search className="w-5 h-5 text-cream/70" />
          </button>
          <button className="w-10 h-10 rounded-full glass border border-cream/10 flex items-center justify-center active:scale-95 transition relative">
            <Bell className="w-5 h-5 text-cream/70" />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-gold" />
          </button>
        </div>
      </div>

      <div
        onClick={() => onOpenCategory(CATEGORIES[0])}
        className="relative rounded-3xl overflow-hidden p-6 bg-gradient-to-br from-emerald-deep via-emerald-mid to-emerald-deep animate-gradient-pan cursor-pointer active:scale-[0.99] transition shadow-xl shadow-emerald-deep/30"
      >
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-gold/20 blur-2xl" />
        <div className="absolute right-4 bottom-4 w-24 h-24 rounded-full border-2 border-gold/30" />
        <div className="absolute right-10 bottom-10 w-12 h-12 rounded-full bg-gold/90 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-emerald-deep" strokeWidth={2.5} />
        </div>
        <div className="relative">
          <span className="inline-block text-[11px] font-bold text-emerald-deep bg-gold px-3 py-1 rounded-full mb-3">{t('home.hero_badge')}</span>
          <h2 className="font-display text-[1.6rem] leading-tight font-extrabold text-paper text-balance max-w-[60%]">
            {t('home.hero_title')}
          </h2>
          <p className="text-cream/70 text-sm mt-1.5 max-w-[65%]">{t('home.hero_sub')}</p>
          <div className="inline-flex items-center gap-1.5 mt-4 text-gold text-sm font-semibold">
            {t('home.hero_cta')} <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-bold text-paper">{t('home.explore')}</h3>
          <span className="text-xs text-cream/40 font-medium">{CATEGORIES.length} {t('home.categories')}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onOpenCategory(cat)}
                className={`relative rounded-2xl p-4 text-left bg-gradient-to-br ${cat.gradient} border border-cream/10 overflow-hidden active:scale-[0.97] transition animate-float-in`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {cat.premium && (
                  <span className="absolute top-2.5 right-2.5 text-[9px] font-bold text-emerald-deep bg-paper/90 px-1.5 py-0.5 rounded-full">PRO</span>
                )}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: cat.premium ? 'rgba(0,75,35,0.15)' : 'rgba(255,215,0,0.12)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: cat.accent }} strokeWidth={2} />
                </div>
                <h4 className={`font-display font-bold text-[15px] ${cat.premium ? 'text-emerald-deep' : 'text-paper'}`}>
                  {t(cat.titleKey)}
                </h4>
                <p className={`text-[11px] mt-0.5 ${cat.premium ? 'text-emerald-deep/70' : 'text-cream/55'}`}>
                  {t(cat.descKey)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => setShowDownload(true)}
        className="w-full rounded-2xl bg-gradient-to-r from-emerald-deep to-emerald-mid border border-gold/20 p-4 flex items-center gap-3 active:scale-[0.98] transition animate-float-in"
      >
        <div className="w-11 h-11 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-gold" strokeWidth={2.5} />
        </div>
        <div className="flex-1 text-left">
          <h4 className="font-display font-bold text-[15px] text-paper">{t('home.download')}</h4>
          <p className="text-[12px] text-cream/55">{t('download.sub')}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gold" />
      </button>

      <div className="rounded-2xl glass border border-cream/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-bold text-paper">{t('home.trending')}</h3>
          <span className="text-[11px] text-gold font-semibold">{t('home.see_all')}</span>
        </div>
        <div className="space-y-2.5">
          {[
            { label: t('trending.item1'), tag: t('trending.tag1'), uses: '12.4k' },
            { label: t('trending.item2'), tag: t('trending.tag2'), uses: '8.1k' },
            { label: t('trending.item3'), tag: t('trending.tag3'), uses: '5.7k' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-deep/40 border border-gold/20 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-paper truncate">{item.label}</p>
                <p className="text-[11px] text-cream/45">{item.tag} · {item.uses} {t('home.uses')}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-cream/30" />
            </div>
          ))}
        </div>
      </div>
      {showDownload && <DownloadScreen onClose={() => setShowDownload(false)} />}
    </div>
  );
}
