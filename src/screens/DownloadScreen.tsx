import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Sparkles, Download, X, Smartphone, Zap, Bell, Check, Apple, Monitor } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type Props = {
  onClose: () => void;
};

export default function DownloadScreen({ onClose }: Props) {
  const { t } = useI18n();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setPlatform('ios');
    else if (/android/.test(ua)) setPlatform('android');
    else setPlatform('desktop');

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => setInstalled(true);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') setInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const features = [
    { icon: Smartphone, label: t('download.feature1') },
    { icon: Zap, label: t('download.feature2') },
    { icon: Bell, label: t('download.feature3') },
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-onyx/95 backdrop-blur-xl flex flex-col animate-slide-up safe-top safe-bottom">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-emerald-deep/40 blur-[100px]" />
        <div className="absolute bottom-0 -left-24 w-72 h-72 rounded-full bg-gold/15 blur-[90px]" />
      </div>

      <button
        onClick={onClose}
        className="absolute top-14 right-6 z-10 w-9 h-9 rounded-full glass border border-cream/10 flex items-center justify-center active:scale-90 transition safe-top"
      >
        <X className="w-5 h-5 text-cream/70" />
      </button>

      <div className="relative flex-1 flex flex-col items-center justify-center px-7 max-w-md mx-auto w-full">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold to-gold-soft flex items-center justify-center shadow-2xl shadow-gold/30 mb-6 animate-float-in">
          <Sparkles className="w-12 h-12 text-emerald-deep" strokeWidth={2.5} />
        </div>

        <h2 className="font-display text-[2rem] leading-tight font-extrabold text-paper text-center animate-float-in">
          {t('download.title')}
        </h2>
        <p className="text-cream/60 text-[15px] mt-2 text-center leading-relaxed animate-float-in" style={{ animationDelay: '0.05s' }}>
          {t('download.sub')}
        </p>

        <div className="flex gap-3 mt-6 animate-float-in" style={{ animationDelay: '0.1s' }}>
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="glass border border-cream/10 rounded-2xl px-4 py-3 flex flex-col items-center gap-1.5 w-28">
                <Icon className="w-5 h-5 text-gold" />
                <span className="text-[11px] text-cream/70 font-medium text-center leading-tight">{f.label}</span>
              </div>
            );
          })}
        </div>

        {installed ? (
          <div className="mt-8 w-full glass border border-emerald-soft/30 rounded-2xl p-5 flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-full bg-emerald-soft/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-soft" strokeWidth={3} />
            </div>
            <p className="text-[14px] text-paper font-semibold">AfriNova AI installed!</p>
          </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="mt-8 w-full bg-gradient-to-r from-gold to-gold-soft text-emerald-deep font-bold text-[15px] py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-gold/25 active:scale-[0.98] transition animate-float-in"
            style={{ animationDelay: '0.15s' }}
          >
            <Download className="w-5 h-5" strokeWidth={2.5} /> {t('download.install')}
          </button>
        ) : platform === 'ios' ? (
          <div className="mt-8 w-full animate-float-in" style={{ animationDelay: '0.15s' }}>
            <div className="glass border border-cream/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Apple className="w-5 h-5 text-cream/70" />
                <h3 className="font-display font-bold text-paper text-[15px]">{t('download.ios_title')}</h3>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Share, text: t('download.ios_step1') },
                  { icon: Plus, text: t('download.ios_step2') },
                  { icon: Check, text: t('download.ios_step3') },
                ].map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-gold" />
                      </div>
                      <span className="text-[13px] text-cream/70">{step.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : platform === 'android' ? (
          <div className="mt-8 w-full animate-float-in" style={{ animationDelay: '0.15s' }}>
            <div className="glass border border-cream/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-cream/70" />
                <h3 className="font-display font-bold text-paper text-[15px]">{t('download.android_title')}</h3>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Monitor, text: t('download.android_step1') },
                  { icon: Download, text: t('download.android_step2') },
                  { icon: Check, text: t('download.android_step3') },
                ].map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-gold" />
                      </div>
                      <span className="text-[13px] text-cream/70">{step.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 w-full glass border border-cream/10 rounded-2xl p-5 text-center animate-float-in" style={{ animationDelay: '0.15s' }}>
            <Monitor className="w-8 h-8 text-cream/40 mx-auto mb-2" />
            <p className="text-[13px] text-cream/60">
              {t('download.sub')}
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 text-[14px] text-cream/50 font-medium active:scale-95 transition"
        >
          {t('download.later')}
        </button>
      </div>
    </div>
  );
}

// Inline Share icon for iOS steps
function Share({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

// Inline Plus icon for iOS steps
function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
